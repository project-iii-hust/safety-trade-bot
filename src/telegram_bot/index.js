import axios from 'axios';

export function sendTelegramMessage(chat_id, text) {
  const options = {
    method: 'POST',
    url: `https://api.telegram.org/bot5986678709:AAEsDhQ73hOorO-K6xmfET7T52uH8hRYm8w/sendMessage?chat_id=${chat_id}text=${text}&parse_mode=html`,
    headers: {accept: 'application/json', 'content-type': 'application/json'},
    data: {
      text: 'Required',
      parse_mode: 'Optional',
      disable_web_page_preview: false,
      disable_notification: false,
      reply_to_message_id: null
    }
  };

  axios
  .request(options)
  .then(function (response) {
    console.log(response.data);
  })
  .catch(function (error) {
    console.error(error);
  });
}
