const express = require("express")
// const puppeteer = require("puppeteer")
const rp = require('request-promise')
const cheerio = require('cheerio')
const util = require("util")
const fs = require("fs")
const ejs = require("ejs")

const write = util.promisify(fs.writeFile)
const read = util.promisify(fs.readFile)
const deleteFile = util.promisify(fs.unlink)
const app = express()
const port = process.env.PORT || 80

// const Amazon = () => {
//     const price = document.querySelector("span.a-price-whole")
//     const result = parseFloat(price.innerHTML.replace(',', '.'))
//     return result
//  }

// const Ibs = () => {
//     const price = document.querySelector("span.new-price")
//     const result = parseFloat(price.innerHTML.slice(0, 4).replace(',', '.'))
//     return result
// }

// const Libraccio = () => {
//     const price = document.querySelector("span.sellpr")
//     const result = parseFloat(price.innerHTML.slice(2, 6).replace(',', '.'))
//     return result
// }
const headers = {"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64;     x64; rv:66.0) Gecko/20100101 Firefox/66.0", "Accept-Encoding":"gzip, deflate",     "Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "DNT":"1","Connection":"close", "Upgrade-Insecure-Requests":"1"}

const Amazon = (title, url, html) => {
    const $ = cheerio.load(html)
    console.log(html)
    const price = parseFloat( $("span.a-price-whole:first", html).text().replace(',', '.') )
    return [title, url, "Amazon", price]
}

const Feltrinelli = (title, url, html) => {
    const $ = cheerio.load(html)
    console.log(html)
    const price = parseFloat( $("span.gtmActualPrice:eq(24)", html).text().replace(',', '.') )
    return [title, url, "Feltrinelli", price]
}

const Libraccio = (title, url, html) => {
    const $ = cheerio.load(html)
    const price = parseFloat( $("span.sellpr:first", html).text().slice(2, 6).replace(',', '.') )
    return [title, url, "Libraccio", price]
}
// const scraper = async (url, selector, title, site) => {
//     const browser = await puppeteer.launch({args: [
//         '--no-sandbox',
//         '--disable-setuid-sandbox',
//    ]})
//     const page =  await browser.newPage()
//     await page.setExtraHTTPHeaders({
//         'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36'
//     })
//     await page.goto(url)
//     const prize = await page.evaluate(selector)
//     await browser.close(page)
//     return [title, url, prize, site]
// }

app.set("views", "./views")
app.set("view engine", "ejs")

app.use(express.static(__dirname + "/public"))
app.use(express.urlencoded({extended : false}))
app.use(express.json())

app.post("/titolo", (req, res) => {
    const title = req.body.data
    const urlAmazon = "https://www.amazon.it/s?k=" + title.replace(/\s/g, '+')
    const urlFeltrinelli = "https://www.lafeltrinelli.it/fcom/it/home/pages/catalogo/searchresults.html?prkw=" + title.replace(/\s/g, '+') + "&sort=1"
    const urlLibraccio = "https://www.libraccio.it/src/?FT=" + title.replace(/\s/g, '+')

    // Promise.all([
    // scraper(urlIbs, Ibs, title, "Ibs"), 
    // scraper(urlLibraccio, Libraccio, title, "Libraccio"),
    // scraper(urlAmazon, Amazon, title, "Amazon")
    // ])
    Promise.all([
        rp(urlAmazon, {
    'authority': 'scrapeme.live',
    'dnt': '1',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'sec-fetch-site': 'none',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-user': '?1',
    'sec-fetch-dest': 'document',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
        }),
        rp(urlFeltrinelli),
        rp(urlLibraccio)
    ])
    .then( data => {
        const dataPrices = [
            Amazon(title, urlAmazon, data[0]),
            Feltrinelli(title, urlFeltrinelli, data[1]),
            Libraccio(title, urlLibraccio, data[2])
        ]
        console.log(dataPrices)
        const prices = dataPrices.sort( (a, b) => b[3] - a[3])
        
        const jsonPrices = JSON.stringify({
            "data": prices
        })
        write(__dirname + "/prices.json", jsonPrices)
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
            sito1: prezzi[0][2],
            prezzo1: prezzi[0][3].toString().replace('.', ','),
            link2: prezzi[1][1],
            sito2: prezzi[1][2],
            prezzo2: prezzi[1][3].toString().replace('.', ','),
            link3: prezzi[2][1],
            sito3: prezzi[2][2],
            prezzo3: prezzi[2][3].toString().replace('.', ','),
            title: prezzi[0][0],
            img: "/immagini/" + prezzi[0][0].replace(/\s/g, '').toLowerCase() + ".jpg"
        })
    })
    .catch(console.log)
})

app.listen(port, () => {
    console.log("Listening on port " + port)
})