const PORT=5500;
const cheerio = require("cheerio");
const express = require("express");

const app = express();
const url='https://news.ycombinator.com';
let html;
let finishedPage;

function getHeader(){
    return `
<div style="display:flex; flex-direction:column; align-items:center;">
<h1 style="text-transform:capitalize">Scraper News</h1>
<div style="display:flex; gap:10px; align-items:center;">
<a href="/" id="news" onClick='showLoading()'>Home</a>
<a href="/best" id="best" onClick='showLoading()'>Best</a>
<a href="/newest" id="newest" onClick='showLoading()'>Newest</a>
<a href="/ask" id="ask" onClick='showLoading()'>Ask</a>
<a href="/jobs" id="jobs" onClick='showLoading()'>Jobs</a>
</div>
<p class="loading" style="display:none;">Loading...</p>
</div>
`}

function getScript(type){
    return `
    <script>
    document.title="${type.substring(1)}"
    window.addEventListener("DOMContentLoaded", (e)=>{
      let navLinks = [...document.querySelectorAll("a")];
      let current = document.querySelector("#${type.substring(1)}");
      document.body.style="margin:0 auto; max-width:600px;";
      navLinks.forEach(x=>x.style="color:black; text-decoration:none;");
      current.style.textDecoration="underline";
      current.style.color="black";
      current.style.padding="3px";
      current.style.pointerEvents="none";
    })


    function showLoading(e){
        document.querySelector(".loading").style.display="block";
        document.querySelector(".loading").style.textAlign="center";
    }
    </script>`
}

async function fetchAndRenderPage(type, res){
    const response = await fetch(`${url}${type}`)
    html = await response.text();
        res.set('Content-Type', 'text/html');
        res.write(getHeader());
        
        const $ = cheerio.load(html);
        const articles = [];
        let i = 1;
    
        $('.titleline', html).children('a').each(function(){
            let title = $(this).text();
            articles.push(`<h4>${i}. ${title}</h4>`);
            i++;
        })

        articles.push(getScript(type))
        finishedPage = articles.reduce((c,n)=>c+n);
        res.write(finishedPage);
        res.end();
}

app.get('/', (req, res)=>{
    fetchAndRenderPage('/news', res);
})

app.get('/best', (req, res)=>{
    fetchAndRenderPage('/best', res);
})

app.get('/newest', (req, res)=>{
    fetchAndRenderPage('/newest', res);
})

app.get('/ask', (req, res)=>{
    fetchAndRenderPage('/ask', res);
})

app.get('/jobs', (req, res)=>{
    fetchAndRenderPage('/jobs', res);
})

app.listen(PORT)