const nodemailer = require('nodemailer');
const pug = require('pug')
const {htmlToText} = require('html-to-text')

module.exports =  class Email{
	constructor(user,url){
		this.firstname = user.name.split(' ')[0];
		this.to = user.email;
		this.url = url,
		this.from = process.env.EMAIL_FROM
	}

	newTransporter() {
		if(process.env.NODE_ENV === 'production') {
			return nodemailer.createTransport({
				service: 'SendGrid',
				auth: {
					user: process.env.SENDGRID_USERNAME,
					pass: process.env.SENDGRID_PASSWORD
				}
			})
		}

		return nodemailer.createTransport({
			host:'smtp.mailtrap.io',
			port: 2525,
			auth: {
				user: '84a6513fc79563',
				pass: '2de8f087de8bfb'
			}
		})
	}

	async send(template,subject) {
		// 1) render email from pug template
		const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`,{
			firstname: this.firstname,
			url: this.url,
			subject
		})
		// 2) define email options

		const options = {
			from: this.from,
			to: this.to,
			subject: this.subject,
			html,
			text: htmlToText(html)
		}

		// 3) send email
		await this.newTransporter().sendMail(options)
	}

	async sendWelcome() {
		await this.send('welcome','Welcome to the natours family')
	}

	async sendResetPassword() {
		await this.send('resetPassword', 'Reset Your Password')
	}
}

// module.exports = async options => {
// 	const transport = nodemailer.createTransport({
// 		host: 'smtp.mailtrap.io',
// 		port: 2525,
// 		auth: {
// 			user: '84a6513fc79563',
// 			pass: '2de8f087de8bfb'
// 		}
// 	});
    
// 	await transport.sendMail({
// 		from: '"Natours Admin" <natours@natours.com>',
// 		to: options.to,
// 		subject: options.subject,
// 		text: options.text
// 	});
// };