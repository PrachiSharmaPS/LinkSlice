const getTime = (req, res) => {
  // Delay 5 minutes (300000 ms)
  setTimeout(() => {
    res.json({ success: true, message: "Response after 5 minutes" });
  }, 300000);
};

module.exports = { getTime };
