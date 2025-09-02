const urlModel = require("../model/urlModel");
const shortid = require("shortid");
const axios = require("axios");
const redis = require("redis");
const { promisify } = require("util");
//=================validation===========================//

const valid = function (value) {
  if (typeof value == "undefined" || typeof value == null) {
    return false;
  }
  if (typeof value == "string" && value.trim().length == 0) {
    return false;
  }
  return true;
};


//========================[Apply redis and connect]================

const redisConnect = redis.createClient(
    17763,
  "redis-17763.c305.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);

redisConnect.auth("aCzvJ5E21jJs1JinkECCude94VnCLCQp", function (err) {
  if (err) throw err;
});

redisConnect.on("connect", async function () {
  console.log("Redis is Connected...");
});

const GET_ASYNC = promisify(redisConnect.GET).bind(redisConnect);
const SET_ASYNC = promisify(redisConnect.SETEX).bind(redisConnect);

//========================[Function for Create Shorten URL]==========================//

const urlShort = async (req, res) => {
  
  try {
    let data = req.body;
    let {longUrl}=data
 
    if (Object.keys(data).length == 0)
      return res.status(400).send({ status: false, message: "Body can't be empty" });
    if (Object.keys(data).length > 1) return res.status(400).send({ status: false, message: "Please Provide Only Long URL" })
    if (!longUrl)
      return res.status(400).send({ status: false, message: "longUrl is required" });
    if (!valid(longUrl))
      return res.status(400).send({ status: false, message: "You cannot enter empty string" });
     
       
    // =======================Get from redis=======================
    let cahcedProfileData = await GET_ASYNC(`${longUrl}`);

    if (cahcedProfileData) {
      let txt = JSON.parse(cahcedProfileData);
      return res.status(201).send({ status: true, data: txt });
    }

    let option = {
      method: "get",
      url: longUrl,
    };
    
    let validateUrl = await axios(option)
    
      .then(() => [])
      .catch(() => null);

    if (!validateUrl) {
      return res .status(400).send({
          status: false,
          message: `This Link: ${longUrl} is not Valid URL.`,
        });
    }

    

    let shortUrlId = shortid.generate().toLowerCase();
    let baseUrl = "http://localhost:3000/";
    let obj = {
      longUrl: longUrl.trim(),
      shortUrl: baseUrl + shortUrlId,
      urlCode: shortUrlId
    };

    let findData = await urlModel.findOne({ longUrl: longUrl }).select({ _id: 0, __v: 0 });
    if (findData){
    await SET_ASYNC(`${longUrl}`, 60 * 5, JSON.stringify(findData));
      return res.status(201).send({ status: true, message: findData });}

    let final = await urlModel.create(obj);
    await SET_ASYNC(`${longUrl}`, 60 * 5, JSON.stringify(obj));
    res.status(201).send({ status: true, data: obj });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//==============================[Function to Fetch the URL Data from DB]=========================================//

let getData = async (req, res) => {
  try {
    let urlCode = req.params.urlCode;
    if (!shortid.isValid(urlCode))
    return res.status(400).send({ status: false, message: "Please provide a valid URL code" });
    let cahcedProfileData = await GET_ASYNC(`${urlCode}`);

    if (cahcedProfileData) {
     let txt = JSON.parse(cahcedProfileData);
    return  res.status(302).redirect(txt);
    } 
     
        let findLongUrl = await urlModel.findOne({ urlCode });
        if (!findLongUrl) return res.status(404).send({ status: false, message: "Url code not found" });
      await SET_ASYNC(`${urlCode}`,24*60*60,JSON.stringify(findLongUrl.longUrl));
      
     return res.status(302).redirect(findLongUrl.longUrl);
    
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { urlShort, getData };
