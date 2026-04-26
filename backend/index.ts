import express from 'express';
import {tavily} from '@tavily/core';
import { Output, streamText } from 'ai';
import z from 'zod';
import { PROMPT_TEMPLATE, SYSTEM_PROMPT } from './prompt';
const client = tavily({ apiKey: process.env.TAVILY_API_KEY });


const app = express();

app.use(express.json());

app.post("/Perflexity_ask", async(req,res)=>{
    // step 1- get the query from the user
    const query = req.body.query;


    //step 2- make sure that the user has acess/credits to hit the endpoint

    //step 3(TODO)- check is we have web search indexed for a similar query

    // step-4             web search to gather resources

       const webSearchResponse = await client.search("", {
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
        prompt: 'Invent a new holiday and describe its traditions.',
        system: SYSTEM_PROMPT,
        
    });

    for await (const textPart of result.textStream){
       res.end(textPart);
    }
    //step 6- also stream beack the sources and the follow up questions (which we can get from another parallel LLM call)
});
    


app.listen (3000);





