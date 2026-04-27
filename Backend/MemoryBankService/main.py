import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

# LangChain Imports
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

# Load environment variables (API Key)
load_dotenv()

app = FastAPI(title="Digital Memory Bank API", description="RAG microservice for Alzheimer's patients")

# Global variables for the vector store chain
rag_chain = None

class QuestionRequest(BaseModel):
    query: str

@app.on_event("startup")
async def startup_event():
    global rag_chain
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "YOUR_GEMINI_API_KEY_HERE":
        print("WARNING: GEMINI_API_KEY is not set or is still the default placeholder in .env")
        return
        
    try:
        print("Loading patient memories...")
        # 1. Load the text document containing facts
        loader = TextLoader("memories.txt", encoding="utf-8")
        docs = loader.load()

        # 2. Split it into smaller chunks for the AI to process effectively
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=150, chunk_overlap=20)
        splits = text_splitter.split_documents(docs)

        # 3. Create Vector Store (ChromaDB) to hold memories in memory
        embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001", google_api_key=api_key)
        vectorstore = Chroma.from_documents(documents=splits, embedding=embeddings)
        retriever = vectorstore.as_retriever(search_kwargs={"k": 5}) # Gets the top relevant memories

        # 4. Set up the Retrieval Chain using Gemini
        llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite", google_api_key=api_key)
        
        # This tells the LLM how to behave
        system_prompt = (
            "You are a compassionate memory assistant for an Alzheimer's patient. "
            "Use the following pieces of retrieved memories to answer the user's question politely and warmly. "
            "If the answer is not in the provided memories, gently say you don't recall right now. \n\n"
            "{context}"
        )
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{input}"),
        ])
        
        def format_docs(local_docs):
            return "\n\n".join(doc.page_content for doc in local_docs)
            
        rag_chain = (
            {"context": retriever | format_docs, "input": RunnablePassthrough()}
            | prompt
            | llm
            | StrOutputParser()
        )
        print("Memory Bank initialized successfully!")
    except Exception as e:
        print(f"Error initializing RAG: {e}")

@app.post("/ask")
async def ask_question(request: QuestionRequest):
    if not rag_chain:
        raise HTTPException(status_code=500, detail="Service not initialized. Please check your GEMINI API key.")
    
    try:
        # Run the question against the memory database
        response = rag_chain.invoke(request.query)
        return {"answer": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "up", "service": "MemoryBank"}
