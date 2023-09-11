// Import all requires
const express = require('express');
const axios = require('axios');

require("dotenv").config(); // Load environment variables from .env file

const app = express();

// Configeration
app.set("view engine", "ejs");
app.set("views","./views")

// Middleware
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded request bodies

// Routes
app.get('/',(req,res)=>{
    res.render('home')
})
const userChatHistory = {1:{}};
app.post('/hf',async (req,res)=>{
    try{
        const prompt = req.body.prompt;
        console.log("prompt:",prompt)
        const uri = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-large";
        const requestBody = {
            inputs: {
                generated_responses:userChatHistory[1].generated_responses||[],
                past_user_inputs:userChatHistory[1].past_user_inputs||[],
                text:prompt
            }
        }
        const requestHeader = {
            'Authorization': `Bearer ${process.env.HF_KEY}`,
            'Content-Type': 'application/json',
        };
        console.log("Data:",requestBody)
        const response = await axios.post(uri,requestBody,requestHeader)
        console.log("API Respose:",response.data)
        const result = response.data['generated_text']
        if(userChatHistory[1].generated_responses){
            userChatHistory[1].generated_responses.push(result);
        }
        else{userChatHistory[1].generated_responses=[result]}
        if(userChatHistory[1].past_user_inputs) {
            userChatHistory[1].past_user_inputs.push(prompt);
        }else{userChatHistory[1].past_user_inputs=[prompt]}
        console.log("After Api receive:",userChatHistory)
        return res.json({"data":result});
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:"Server Error"});
    }
})

// Listener
app.listen(8080, ()=>{
    console.log("\x1b[36m Server is running at PORT:8080 \x1b[0m");
});