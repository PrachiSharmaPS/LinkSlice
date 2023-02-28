const express = require("express")
const router = express.Router()
const urlController = require("../controller/urlController")

router.post("/url/shorten",urlController.urlShort )

router.get("/:urlCode", urlController.getData)

router.all('/*', function(req,res){
    return res.status(400).send({message: "Invalid HTTPS Request"})
})


module.exports = router