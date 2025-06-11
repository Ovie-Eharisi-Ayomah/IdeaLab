from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get('/health')
async def health():
    return {'status': 'ok', 'message': 'Minimal test API running'}

if __name__ == '__main__':
    print('Starting minimal test API server...')
    uvicorn.run(app, host='0.0.0.0', port=8000) 