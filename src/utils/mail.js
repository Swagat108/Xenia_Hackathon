import Mailgen from "mailgen";
import nodemailer from "nodemailer"

const sendEmail = async (options) => 
{

    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Task manager",
            link: "https://taskmanagerLink.com",
        },
    })
    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);

    const emailHtml = mailGenerator.generate(options.mailgenContent);

    const transporter = nodemailer.createTransport({

        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_POST,
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS,
        }

    })
    try {
        await transporter.sendMail({
            from: "mail.taskmanager@example.com",
            to: options.email,
            subject: options.subject,
            text: emailTextual,
            html: emailHtml,
        })
    } catch (error) {
        console.error("Make sure you entered all valid credentials");
        console.error("Error : ", error);
    }

}
const emailverificationMailgen = (userName, verificationUrl) => {
    return {
        body: {
            name: userName,
            intro: "Welcome to our application ! We are very excited to have you on board",
            action: {
                instructions: "To verify you email please click on the following button",
                button: {
                    colour: "#22BC66",
                    text: "Verify your email",
                    link: verificationUrl,
                },
            },
            outro: "Need help ? If you have any query please reply on the email.",
        },
    }
}
const forgotPasswordMailgen = (userName, passwordResetUrl) => {
    return {
        body: {
            name: userName,
            intro: "You are requested to reset your password.",
            action: {
                instructions: "To reset your password please click on the belo link or button",
                button: {
                    colour: "#22BC66",
                    text: "Reset the password",
                    link: passwordResetUrl,
                },
            },
            outro: "Need help ? If you have any query please reply on the email.",
        },
    }
}
export { emailverificationMailgen , forgotPasswordMailgen , sendEmail };

