const express = require("express")
const puppeteer = require("puppeteer")
const util = require("util")
const fs = require("fs")
const ejs = require("ejs")

const write = util.promisify(fs.writeFile)
const read = util.promisify(fs.readFile)
const app = express()
const port = process.env.PORT || 80

const Amazon = () => {
    return parseFloat(document.querySelector("span.a-price-whole").innerHTML.replaceAll(",", "."))
 }

const Ibs = () => {
    return parseFloat(document.querySelector("span.new-price").innerHTML.slice(0, 4).replaceAll(",", "."))
}

const Libraccio = () => {
    return parseFloat(document.querySelector("span.sellpr").innerHTML.slice(2, 6).replaceAll(",", "."))
}

const scraper = async (url, selector, title, site) => {
    const browser = await puppeteer.launch({ headless: true })
    const page =  await browser.newPage()
    await page.goto(url)
    const prize = await page.evaluate(selector)
    browser.close()
    return [title, url, prize, site]
}

app.set("views", "./views")
app.set("view engine", "ejs")

app.use(express.static(__dirname + "/public"))
app.use(express.urlencoded({extended : false}))
app.use(express.json())

app.get("/", (req, res) => {
    res.sendFile("index.html")
})

app.post("/titolo", (req, res) => {
    const title = req.body.data
    const urlAmazon = "https://www.amazon.it/s?k=" + title.replaceAll(' ', '+')
    const urlIbs = "https://www.ibs.it/algolia-search?&query=" + title.replaceAll(' ', '%20')
    const urlLibraccio = "https://www.libraccio.it/src/?FT=" + title.replaceAll(' ', '+')
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
        write("prices.json", jsonInfo)
        .then(response => {
            res.status(200).end()
        })
        .catch(console.log)
        
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
            prezzo1: prezzi[0][2].toString().replaceAll(".", ","),
            link2: prezzi[1][1],
            sito2: prezzi[1][3],
            prezzo2: prezzi[1][2].toString().replaceAll(".", ","),
            link3: prezzi[2][1],
            sito3: prezzi[2][3],
            prezzo3: prezzi[2][2].toString().replaceAll(".", ","),
            title: prezzi[0][0],
            img: "/immagini/" + prezzi[0][0].replaceAll(' ', '').toLowerCase() + ".jpg"
        })
    })
    .catch(console.log)
})

app.listen(port, () => {
    console.log("Listening on port " + port)
})