/* eslint-disable max-len */
import dotenv from 'dotenv';

dotenv.config();

export default {
  type: 'service_account',
  project_id: process.env.FCM_PRODJECT_ID,
  private_key_id: process.env.FCM_PRIVATE_KEY_ID,
  private_key: process.env.FCM_PRIVATE_KEY,
  client_email: process.env.FCM_CLIENT_EMAIL,
  client_id: process.env.FCM_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url:
    'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env.FCM_CLIENT_CERT_URL,
};

/*
console.log(
  '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC9LODWO2yaTrAO\na3RFiRfa4OdI+BfiP3yEiSi05sk2x/+OiZ0QOAp7DeQdKPWIcpP2BBYLinwJ9Uts\nvz+MjJHc/34AFlPAGHaSsYbExoKtHTFQZ5MxodhREzK4e9jRqV0MfxWxjDfyKVVK\nRxupLVU6kt69f7VK3vEpcVg9WHWQIaWD8nXXehnte/LJEcVdrBofUCRRqZ5XtJdY\nSM88tiUOUE9zqaA1ijXQ0ypJ+oBRSeD1p46J/ZOBp6SZKV7YyjOx3I7mTEQgQrgH\n11BvYXS4UorTry9O81r8lOZD56AMfsxAhbJeT3UqJdMCg1D4YT9gJIM3vvHGsurX\nN3b0NKj5AgMBAAECgf9DPrCtdnIkZ9QtTAUIsrLIGyobxhS3V9nrQtY1d9QOpQky\nobgzC7iuBUIRG34sAo6V5N3xPEjbQVaOUW1FiLJQ3IDthwI+RnPfsTs2t1m8L6RX\n8HliKyW5rBlbeqqX3Jw21PXhJva8HfUzchNjD7o8F/kVY1AOTTFsid3T8J3ZnX+p\neL0EXchBpH59KA3iY8eapBDbPr380YJDvJOqUTfjhY8xl7DnI8xF8di65+KUmRyt\n9waQICy7hc7WgAqBQhC3Loy8HVwMQ7LmyznFJrQ0twr8FSSqU6ZrUGo7kPhIY+Nn\nOQzmwY/SI3xWy5NvOjx6/3MdQ4sjDe2Fs9c8y70CgYEA5EtPU7XU9Wng+iCUoZSz\nsHRKBZqO2RWRDbZUmzAgmheuB0TmGEXqqAanmIXwT2D33/NWBHzsnRXkAyLNXgFs\n2z9TjLw3pQl0VSo+/8pa5fIYZqRX9EWwqheihIvnDmH578srTziScvBYkTFJHD3r\nev9xb//zL+PSI7cRjcfugscCgYEA1CI3GyFZwEz1sfVti8IYTY21d1aU3ewqlKbj\nxTRESa447vYSn9xoIboD2QKgX2UdayEMCfjywV6MqOM09ZMBuCuCosAfm9GIxNw1\nfuHbBryb5yO8JT1jj9nLdq+diaaxZBKUMCkYinLohs2fuE1Mft6iZHweTWsKyyEw\nJGsvtj8CgYEAsdDO2t7YHsb3SxuxaSGPzDLnrPGzrfaUYt/Pioiz/BHRpSvPJLzg\nhzuXsr8wbEOVDkRUjW5YRgpU7PRgjYYCqcrrYsT/enagu+0J4OZWYqBszRXYxBS8\nA+Ag36iwsY0yxcmz1CK2Pvxhn8WJsouwLL9mNdxgKL8EYHkpHQvLBOUCgYEAkMPY\nv1b/HNBoS02luF54n1Q5pnsblGb6l/9cKNQGVhHjIJAlHZsYJQwAXDQCpZcngFhJ\nEvUlFPklHIwRNBVicwCeYdqit39CyrVMfI49HlfQPOiSGQfPzfdfdltaMvnizNww\n7Lze1nycWoIwoWF+9oWQZOqe8049S2oWpIPRR5kCgYEA3Z7pmlJEW1coei1F0W26\nAh0j6TL3HcgkyCET+gDYqGYs36u6pnxACkl7WFFrYRIJ0cpt5GNApIpfTBrrHx+5\neC1NNwgnWVYakyAe7PD4kdkTQAvX65RKbRmC5u9Qy466QMiNlirZtc8D7jPKWa5d\nOWZ7eVUa0JWS3LU9IxS4/yw=\n-----END PRIVATE KEY-----\n',
);

console.log('FCM_PRIVATE_KEY', process.env.FCM_PRIVATE_KEY.toString());
*/
