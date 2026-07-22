const getMyDetails = async function(req,res){
    const user = req.currentUser;
    if(!user){
        return res.status(400).json({
            "message":"user not found!"
        })
    }

    res.status(200).json({
        user
    })

}

module.exports = {getMyDetails};