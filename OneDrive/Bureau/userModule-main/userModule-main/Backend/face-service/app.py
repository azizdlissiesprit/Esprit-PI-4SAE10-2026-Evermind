from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from io import BytesIO
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Any

from deepface import DeepFace
from PIL import Image
from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.routing import Route


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
IMAGE_DIR = DATA_DIR / "images"
METADATA_PATH = DATA_DIR / "metadata.json"

# Faster CPU-friendly configuration for app/demo use.
MODEL_NAME = "Facenet"
DETECTOR_BACKEND = "opencv"
DISTANCE_METRIC = "cosine"
MODEL_READY = False
MODEL_ERROR: str | None = None


def ensure_storage() -> None:
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    if not METADATA_PATH.exists():
        METADATA_PATH.write_text("{}", encoding="utf-8")


def load_metadata() -> dict[str, dict[str, str]]:
    ensure_storage()
    try:
        return json.loads(METADATA_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        backup_path = METADATA_PATH.with_suffix(".corrupt.json")
        try:
            METADATA_PATH.replace(backup_path)
        except OSError:
            pass
        METADATA_PATH.write_text("{}", encoding="utf-8")
        return {}


def save_metadata(metadata: dict[str, dict[str, str]]) -> None:
    ensure_storage()
    METADATA_PATH.write_text(json.dumps(metadata, indent=2), encoding="utf-8")


def ensure_model_ready() -> None:
    global MODEL_READY, MODEL_ERROR
    if MODEL_READY:
        return
    try:
        DeepFace.build_model(task="facial_recognition", model_name=MODEL_NAME)
        MODEL_READY = True
        MODEL_ERROR = None
    except Exception as exc:
        MODEL_ERROR = str(exc)
        raise RuntimeError("Face recognition model is not ready") from exc


def to_float(value: Any) -> float | None:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


async def read_form_image(request: Request) -> tuple[bytes, Any]:
    form = await request.form()
    image = form.get("image")
    if image is None:
        raise ValueError("Face image is required")
    if not getattr(image, "content_type", "") or not image.content_type.startswith("image/"):
        raise TypeError("Face image must be an image file")

    payload = await image.read()
    if not payload:
        raise ValueError("Face image is required")

    validate_image(payload)
    return payload, image


def validate_image(image_bytes: bytes) -> None:
    try:
        image = Image.open(BytesIO(image_bytes))
        image.verify()
    except Exception as exc:
        raise ValueError("Invalid image") from exc


def write_temp_image(image_bytes: bytes, suffix: str) -> str:
    temp_file = NamedTemporaryFile(delete=False, suffix=suffix)
    temp_file.write(image_bytes)
    temp_file.flush()
    temp_file.close()
    return temp_file.name


def safe_remove(path: str | None) -> None:
    if not path:
        return
    try:
        os.remove(path)
    except OSError:
        pass


def assert_single_face(image_path: str) -> None:
    try:
        faces = DeepFace.extract_faces(
            img_path=image_path,
            detector_backend=DETECTOR_BACKEND,
            enforce_detection=True,
            anti_spoofing=False,
        )
    except ValueError as exc:
        raise ValueError("No face detected. Use a clear, front-facing portrait.") from exc
    except Exception as exc:
        raise ValueError("Face detection failed. Try a clearer image.") from exc

    if len(faces) != 1:
        raise ValueError("Exactly one face must be visible in the image.")


def verify_faces(reference_path: str, candidate_path: str) -> dict[str, Any]:
    try:
        ensure_model_ready()
        result = DeepFace.verify(
            img1_path=reference_path,
            img2_path=candidate_path,
            model_name=MODEL_NAME,
            detector_backend=DETECTOR_BACKEND,
            distance_metric=DISTANCE_METRIC,
            enforce_detection=True,
            align=True,
            normalization="base",
            silent=True,
        )
        return result
    except ValueError as exc:
        raise ValueError("Face verification failed. Make sure your face is well lit and centered.") from exc
    except Exception as exc:
        raise RuntimeError("Unexpected face verification failure") from exc


async def startup() -> None:
    ensure_storage()
    # Warm the recognition model once so the first real request is faster.
    try:
        ensure_model_ready()
    except RuntimeError:
        # Keep the API up so health checks and retries still work.
        pass


async def health(request: Request) -> JSONResponse:
    return JSONResponse(
        {
            "status": "ok",
            "service": "face-service",
            "model": MODEL_NAME,
            "detector": DETECTOR_BACKEND,
            "modelReady": MODEL_READY,
            "modelError": MODEL_ERROR,
        }
    )


async def enroll_face(request: Request) -> JSONResponse:
    ensure_storage()
    form = await request.form()
    user_id = form.get("user_id")
    email = form.get("email")

    if not user_id or not email:
        return JSONResponse({"detail": "user_id and email are required"}, status_code=400)

    temp_path: str | None = None
    try:
        payload, image = await read_form_image(request)
        extension = Path(getattr(image, "filename", "") or "face.png").suffix or ".png"
        temp_path = write_temp_image(payload, extension)
        assert_single_face(temp_path)

        safe_email = "".join(char if char.isalnum() or char in "._-" else "_" for char in str(email))
        file_name = f"{safe_email}_{user_id}{extension}"
        image_path = IMAGE_DIR / file_name
        image_path.write_bytes(payload)

        metadata = load_metadata()
        previous_path = metadata.get(str(user_id), {}).get("image_path")
        metadata[str(user_id)] = {
            "user_id": str(user_id),
            "email": str(email),
            "image_path": str(image_path),
            "model": MODEL_NAME,
            "detector": DETECTOR_BACKEND,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        save_metadata(metadata)
        if previous_path and previous_path != str(image_path):
            safe_remove(previous_path)

        return JSONResponse(
            {
                "success": True,
                "signature": "deepface-reference",
                "imagePath": str(image_path),
            }
        )
    except TypeError as exc:
        return JSONResponse({"detail": str(exc)}, status_code=400)
    except ValueError as exc:
        return JSONResponse({"detail": str(exc)}, status_code=400)
    finally:
        safe_remove(temp_path)


async def verify_face(request: Request) -> JSONResponse:
    form = await request.form()
    user_id = form.get("user_id")
    if not user_id:
        return JSONResponse({"detail": "user_id is required"}, status_code=400)

    metadata = load_metadata()
    profile = metadata.get(str(user_id))
    if not profile:
        return JSONResponse({"detail": "Face profile not found"}, status_code=404)

    temp_path: str | None = None
    try:
        payload, image = await read_form_image(request)
        extension = Path(getattr(image, "filename", "") or "face.png").suffix or ".png"
        temp_path = write_temp_image(payload, extension)
        assert_single_face(temp_path)

        reference_path = profile.get("image_path")
        if not reference_path or not Path(reference_path).exists():
            return JSONResponse({"detail": "Stored reference image is missing"}, status_code=404)

        result = verify_faces(reference_path, temp_path)
        matched = bool(result.get("verified", False))
        distance_raw = to_float(result.get("distance"))
        threshold_raw = to_float(result.get("threshold"))

        return JSONResponse(
            {
                "success": True,
                "matched": matched,
                "distance": int(round(distance_raw)) if distance_raw is not None else None,
                "distanceRaw": distance_raw,
                "threshold": int(round(threshold_raw)) if threshold_raw is not None else None,
                "thresholdRaw": threshold_raw,
                "model": MODEL_NAME,
                "detector": DETECTOR_BACKEND,
            }
        )
    except TypeError as exc:
        return JSONResponse({"detail": str(exc)}, status_code=400)
    except ValueError as exc:
        return JSONResponse({"detail": str(exc)}, status_code=400)
    except RuntimeError as exc:
        return JSONResponse({"detail": str(exc), "modelReady": MODEL_READY}, status_code=503)
    finally:
        safe_remove(temp_path)


async def delete_face(request: Request) -> JSONResponse:
    user_id = request.path_params["user_id"]
    metadata = load_metadata()
    profile = metadata.pop(str(user_id), None)
    if profile and profile.get("image_path"):
        safe_remove(profile.get("image_path"))
    save_metadata(metadata)
    return JSONResponse({"success": True})


app = Starlette(
    debug=False,
    on_startup=[startup],
    routes=[
        Route("/health", health, methods=["GET"]),
        Route("/face/enroll", enroll_face, methods=["POST"]),
        Route("/face/verify", verify_face, methods=["POST"]),
        Route("/face/{user_id:str}", delete_face, methods=["DELETE"]),
    ],
)
