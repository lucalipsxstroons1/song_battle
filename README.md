# song_battle

## Backend-Server

```bash
# only local connections
cd backend
python3 -m uvicorn main:app --reload

# can connect form any ip
cd backend
python3 -m uvicorn --host 0.0.0.0 main:app --reload
```

## Frontend Server

```bash
python -m http.server 7000
```
