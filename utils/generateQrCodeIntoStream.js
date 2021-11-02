const _ = require("lodash");
const PassThrough = require("stream").PassThrough;
const QRCode = require("qrcode");

const generateQrCodeIntoStream = async function(qrCodeText) {
	// https://stackoverflow.com/questions/59863984/express-generate-and-return-qr-code-on-get-request
	const qrStream = new PassThrough();
	await QRCode.toFileStream(qrStream, qrCodeText, {
		type: 'png',
		width: 175,
		errorCorrectionLevel: 'H'
	});
	return qrStream;
};

module.exports = generateQrCodeIntoStream;
