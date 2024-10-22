import { db } from "@/db";
import { getPineconeClient } from "@/lib/pinecone";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { NextRequest, userAgent } from "next/server";

export const POST = async (req: NextRequest) => {
  //endpoint for asking a question to a pdf file

  const body = await req.json();

  const { getUser } = getKindeServerSession();
  const user = await getUser();

 

  if (!user?.id) return new Response("Unauthorized", { status: 401 });

  const {fileId,message} = SendMessageValidator.parse(body)

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId: user.id,
    }
  })

  if(!file) 
    return new Response('Not Found' , {status : 404})

  await db.message.create({
    data: {
      text : message,
      isUserMessage: true,
      userId: user.id,
      fileId,
    },
  })

  // llm - large language model 

  //1. vectorize user message

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  })

  const pinecone = await getPineconeClient()

  const pineconeIndex = pinecone.Index("readeasepdf")

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: file.id
  })
  
  const results = await vectorStore.similaritySearch(message,4)

  const prevMessage = await db.message.findMany({
    where: {
      fileId,
    },
    orderBy:{
      createdAt: "asc"
    },
    take:6
  })

  const formattedMessages = pre
};
