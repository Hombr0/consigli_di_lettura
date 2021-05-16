const express = require("express")
const axios = require('axios')
const cheerio = require('cheerio')
const util = require("util")
const fs = require("fs")
const ejs = require("ejs")

const write = util.promisify(fs.writeFile)
const read = util.promisify(fs.readFile)

const app = express()
const port = process.env.PORT || 8080

const headers = {
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7,la;q=0.6',
    'cache-control': 'max-age=0',
    'dnt': '1',
    'downlink': '10',
    'ect': '4g',
    'rtt': '0',
    'sec-ch-ua': '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'none',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36'}


const Ibs = (title, url, html) => {
    const $ = cheerio.load(html)
    const price = parseFloat( $("span.new-price:first", html).text().replace(',', '.') + $("span.decimals:first", html).text())
    return [title, url, "Ibs", price]
}

const Feltrinelli = (title, url, html) => {
    const $ = cheerio.load(html)
    const price = parseFloat( $("span.gtmActualPrice:eq(24)", html).text().replace(',', '.') )
    return [title, url, "Feltrinelli", price]
}

const Libraccio = (title, url, html) => {
    const $ = cheerio.load(html)
    const price = parseFloat( $("span.sellpr:first", html).text().slice(2, 6).replace(',', '.') )
    return [title, url, "Libraccio", price]
}

app.set("views", "./views")
app.set("view engine", "ejs")

app.use(express.static(__dirname + "/public"))
app.use(express.urlencoded({extended : false}))
app.use(express.json())

app.post("/titolo", (req, res) => {
    const title = req.body.data
    const urlIbs = "https://www.ibs.it/search/?ts=xs&product_type=ITBOOK&gn_Title=" + title.replace(/\s/g, "%20") + "&Products_per_page=25&Default=asc"
    const urlFeltrinelli = "https://www.lafeltrinelli.it/fcom/it/home/pages/catalogo/searchresults.html?prkw=" + title.replace(/\s/g, '+') + "&sort=1"
    const urlLibraccio = "https://www.libraccio.it/src/?FT=" + title.replace(/\s/g, '+')

    Promise.all(
    [
        axios.get(urlIbs, headers),
        axios.get(urlFeltrinelli, headers),
        axios.get(urlLibraccio, headers)
    ])
    .then( data => {
        const dataPrices = [
            Ibs(title, urlIbs, data[0].data),
            Feltrinelli(title, urlFeltrinelli, data[1].data),
            Libraccio(title, urlLibraccio, data[2].data)
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
    .catch( err => {
        throw err
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