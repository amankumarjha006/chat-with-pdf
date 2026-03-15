from ingestion import model

def retrieve(question: str, index, chunks: list[str], k: int = 4) -> list[str]:
    query_vector = model.encode([question]).astype("float32")
    distances, indices = index.search(query_vector, k)
    top_indices = indices[0].tolist()
    return [chunks[i] for i in top_indices if i != -1]