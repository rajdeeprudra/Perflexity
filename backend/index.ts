import express from 'express';
import { tavily } from '@tavily/core';
import { Output, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import z, { url } from 'zod';
import { PROMPT_TEMPLATE, SYSTEM_PROMPT } from './prompt';


const client = tavily({ apiKey: process.env.TAVILY_API_KEY });


const app = express();

app.use(express.json());

//signup
app.post("/signup",(req,res)=>{

});
//signin
app.post("/signin",(req,res)=>{

});
//get past conversations
app.get("/conversations", (req,res)=>{

});
//get past conversation by id
app.get("/conversations/conversationId", (req,res)=>{

});
// perflexity ask post
app.post("/Perflexity_ask", async(req,res)=>{
    // step 1- get the query from the user
    const query = req.body.query;


    //step 2- make sure that the user has acess/credits to hit the endpoint

    //step 3(TODO)- check is we have web search indexed for a similar query

    // step-4 web search to gather resources

       const webSearchResponse = await client.search(query, {
        searchDepth: "advanced"
        })
        
        const webSearchResult = webSearchResponse.results;
        

    //step 5- do some context engineering on the pormpt + web search responses

    //step 6- hit the LLM and stream back response(vercel ai gateway)

    const prompt = PROMPT_TEMPLATE
        .replace("{{WEB_SEARCH_RESULTS}}",JSON.stringify(webSearchResult) )
        .replace("{{USER_QUERY}}",query)
   
    const result = streamText({
        model: 'openai/gpt-5.4',
        prompt: prompt,
        system: SYSTEM_PROMPT,
        
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const textPart of result.textStream){
       res.write(textPart);
    }

    res.write("\n<SOURCES>\n")

    //step 7- also stream beack the sources and the follow up questions (which we can get from another parallel LLM call)
    res.write(JSON.stringify(webSearchResult.map(result => ({url:result.url}))));

    res.write("\n</SOURCES>\n")
    //step -8 end the event stream
    res.end();
});
 

//end point for followup question
app.post("/Perflexity_ask/follow_up", async(req,res)=>{
    // step-1 get the existing chats from db
    //step -2 forward the full history to the llm
    //step -2.5 - TODO : - Do context engineering here
    // step-3 stream the responce to the user 
})


app.listen (3000);





