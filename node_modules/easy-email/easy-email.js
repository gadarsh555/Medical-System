
module.exports =
{
    send_email : function(res,redirect_pos,name,email_from,email_pass,email_to,subject_text,text_msg,img_name,img_src)
    {    
        var nodemailer = require('nodemailer');
        var fs = require('fs');
          
        var transporter = nodemailer.createTransport({
            service : 'Gmail',
            auth : {
                user :  email_from,
                pass : email_pass
            }
        });
       // img_src = '#';
         var mailOptions = {
             from : email_from,
             to : email_to,
             subject : subject_text,
             text : 'Name : '+name+' , Email-id : '+email_from+' has sent you a message.',
             html : 'Name : '+name+' ,<br> Email-id : '+email_from+' has sent you a message. <br>The message is : <br><b>'+text_msg+'</b><br>',
            
         };
         if(img_src != '')
         {
            mailOptions.attachments = [{   // stream as an attachment
                filename: img_name,
                content: fs.createReadStream(img_src)  /* path: __dirname + '/public/images/1.jpg', */
            }];
         }
      
         transporter.sendMail(mailOptions,function(error,info){
                  if(error)
                  {
                      console.log(error);
                  }
                  else
                  {
                      console.log('Message has been sent Successfully , with '+info.response);
                  }
                  
                  res.redirect(redirect_pos);
         });
      
    }

};