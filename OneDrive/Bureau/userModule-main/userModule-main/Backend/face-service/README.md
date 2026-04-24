# face-service

Starlette service for real face enrollment and verification using `DeepFace`.

## Run

```bash
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

The first run may take longer because the face model weights need to be prepared locally.

## Endpoints

- `GET /health`
- `POST /face/enroll`
- `POST /face/verify`
- `DELETE /face/{user_id}`
