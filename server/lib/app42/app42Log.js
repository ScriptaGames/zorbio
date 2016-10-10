module.exports = {
	debug : function (messageString){
		if(this.debugValue == true)
		console.log(messageString)
	},
	setDebug : function (bool){
		this.debugValue = bool
	},
	info : function (messageString){
		console.log(messageString)
	},
	error : function (messageString){
		console.log(messageString)
	},
	fatal : function (messageString){
		console.log(messageString)
	}
}