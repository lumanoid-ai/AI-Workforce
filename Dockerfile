FROM python:3.12-slim
WORKDIR /app
RUN useradd -m -u 1000 user
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY --chown=user . .
RUN mkdir -p data/uploads data/resumes data/ics data/chroma && chown -R user:user /app/data
USER user
EXPOSE 7860
CMD ["sh", "-c", "python -m scripts.seed_demo || true; uvicorn app.main:app --host 0.0.0.0 --port 7860"]