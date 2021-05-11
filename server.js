const express = require("express")
const puppeteer = require("puppeteer")
const util = require("util")
const fs = require("fs")
const ejs = require("ejs")

const write = util.promisify(fs.writeFile)
const read = util.promisify(fs.readFile)
const deleteFile = util.promisify(fs.unlink)
const app = express()
const port = process.env.PORT || 80

const Amazon = () => {
    return parseFloat(document.querySelector("span.a-price-whole").innerHTML.replace(',', '.'))
 }

const Ibs = () => {
    return parseFloat(document.querySelector("span.new-price").innerHTML.slice(0, 4).replace(',', '.'))
}

const Libraccio = () => {
    return parseFloat(document.querySelector("span.sellpr").innerHTML.slice(2, 6).replace(',', '.'))
}

const scraper = async (url, selector, title, site) => {
    const browser = await puppeteer.launch({args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--proxy-server="direct://"',
        '--proxy-bypass-list=*'
   ]})
    const page =  await browser.newPage()
    await page.setExtraHTTPHeaders({
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36'
    })
    await page.goto(url)
    const prize = await page.evaluate(selector)
    await browser.close()
    return [title, url, prize, site]
}

app.set("views", "./views")
app.set("view engine", "ejs")

app.use(express.static(__dirname + "/public"))
app.use(express.urlencoded({extended : false}))
app.use(express.json())

app.post("/titolo", (req, res) => {
    const title = req.body.data
    const urlAmazon = "https://www.amazon.it/s?k=" + title.replace(/\s/g, '+')
    const urlIbs = "https://www.ibs.it/algolia-search?&query=" + title.replace(/\s/g, '%20')
    const urlLibraccio = "https://www.libraccio.it/src/?FT=" + title.replace(/\s/g, '+')
    Promise.all([
    scraper(urlIbs, Ibs, title, "Ibs"), 
    scraper(urlLibraccio, Libraccio, title, "Libraccio"),
    scraper(urlAmazon, Amazon, title, "Amazon")
    ])
    .then( data => {
        const info = data.sort( (a, b) => b[2] - a[2])
        const jsonInfo = JSON.stringify({
            "data": info
        })
        write(__dirname + "/prices.json", jsonInfo)
        .then(response => {
            res.status(200).end()
        })
        .catch(err => {
            throw err
        })
        
    })
    .catch(err => {
        console.log(err)
        res.send(err)
    })
})

app.get("/prezzi", (req, res) => {
    read(__dirname + "/prices.json")
    .then( response => {
        const prezzi = JSON.parse(response).data
        res.render("prezzi.ejs", 
        {
            link1: prezzi[0][1],
            sito1: prezzi[0][3],
            prezzo1: prezzi[0][2].toString().replace('.', ','),
            link2: prezzi[1][1],
            sito2: prezzi[1][3],
            prezzo2: prezzi[1][2].toString().replace('.', ','),
            link3: prezzi[2][1],
            sito3: prezzi[2][3],
            prezzo3: prezzi[2][2].toString().replace('.', ','),
            title: prezzi[0][0],
            img: "/immagini/" + prezzi[0][0].replace(/\s/g, '').toLowerCase() + ".jpg"
        })
        deleteFile(__dirname + "/prices.json")
        .catch(err => {
            throw err
        })
    })
    .catch(console.log)
})

app.listen(port, () => {
    console.log("Listening on port " + port)
})