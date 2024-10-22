import { Pinecone } from '@pinecone-database/pinecone';

export const getPineconeClient = async () => {
  const client = await new Pinecone(
    {
      apiKey: process.env.PINECONE_API_KEY!,
      
    }
  )

  return client
}