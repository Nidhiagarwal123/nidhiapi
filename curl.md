#Useful CURL commands

Curl for upload image 
---
curl -v -H "x-access-token:eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjo5ODg2NjgxNTY2LCJpZCI6ImZjNDkzNzkxLTgyNDUtNGEzZS05MjM2LTMyMWQ0ZWUyNGM2MiIsImlhdCI6MTQ2NDU5NDI1NiwiZXhwIjoxNDY2Mzk0MjU2fQ.B61mXSbLwWH6ehj3kdyV7AdtotgNGkeXz6uiD-KRvJU" -F file=@polycot.JPG -F title=hello http://localhost:8088/api/user/5d869e70-e47c-46da-b75a-b1125b7539e6/avtar


curl -v -H "x-access-token:eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjo5ODg2NjgxNTY2LCJpZCI6ImZjNDkzNzkxLTgyNDUtNGEzZS05MjM2LTMyMWQ0ZWUyNGM2MiIsImlhdCI6MTQ2NDU5NDI1NiwiZXhwIjoxNDY2Mzk0MjU2fQ.B61mXSbLwWH6ehj3kdyV7AdtotgNGkeXz6uiD-KRvJU" -F file=@polycot.JPG -F title=hello http://api.t.onground.in/api/user/5d869e70-e47c-46da-b75a-b1125b7539e6/avtar