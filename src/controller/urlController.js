const urlModel = require("../model/urlModel")
const shortid = require('shortid');
 

//=================validation===========================//

const regForLink = function (value) {
    return /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi.test(value);
};

const regForExtension = function (value) {
    return /^https?:\/\/.*\/.*\.(png|gif|webp|jpeg|jpg)\??.*$/.test(value);
};

const valid = function (value) {
    if (typeof value == "undefined" || typeof value == null) {
        return false;
    }
    if (typeof value == "string" && value.trim().length == 0) {
        return false;
    }
    return true;
  };
  

//======================comment============================//

const urlShort = async (req, res) => {
    //console.log(req)
    try{
        let data = req.body
        let {longUrl} = data
    if (Object.keys(data).length==0) return res.status(400).send({status:false, msg:"Body can't be empty"})
    
    if(!longUrl) return res.status(400).send({status:false, msg:"longUrl is required"})
    if(!valid(longUrl)) return res.status(400).send({status:false, msg:"We cannot enter empty string"})
    if (!regForLink(longUrl)) return res.status(400).send({status:false, msg:"Please provide a valid long url"})
    
    let shortUrlId = shortid.generate().toLowerCase();
    let baseUrl = "http://localhost:3000/"
    let obj = {
    "urlCode": shortUrlId,
    "longUrl": longUrl,
    "shortUrl": baseUrl+shortUrlId
    }
     
    let findData = await urlModel.findOne({longUrl: longUrl}).select({_id: 0, __v:0})
    if (findData) return res.status(200).send({status:true, msg:findData})
    let final = await urlModel.create(obj);
    res.status(201).send({status: true, msg: obj})
    
    }catch(err){
        return res.status(500).send({status:false,message:err.message})
    }
}

//=======================================================================//

let getData = async (req, res) => {
    try{
        let urlCode = req.params.urlCode
    if(!shortid.isValid(urlCode)) return res.status(400).send({status: false, msg: "Please provide a valid URL code"}) 
    let findLongUrl = await urlModel.findOne({urlCode: urlCode});
    if (!findLongUrl) return res.status(404).send({status: false, msg: "Url code not found"})
    res.status(302).redirect(findLongUrl.longUrl)
    }catch(err){
        return res.status(500).send({status:false,message:err.message})
    }

}



module.exports = {urlShort, getData}