#!/bin/bash

# node, npm, yarn 명령어 사용을 위한 설정 (.bashrc 파일에 추가되어 있는 내용)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# 프로젝트 폴더로 이동
cd /home/ubuntu/Give_me_the_ticket

# main 브랜치로 이동
git switch main

# 최신 소스 코드를 가져옴
git pull

# .env 파일 생성
# ">" 는 생성 또는 덮어쓰기
# ">>" 는 내용 덧붙이기
echo "${{ secrets.ENV }}" > .env

# 의존성 설치
npm ci

# 빌드 (ts 아니면 생략 가능)
npm run build

# PM2로 실행 중인 서버 중지 및 삭제
pm2 delete Ticketing

# 서버를 PM2로 실행
pm2 --name Ticketing start dist/src/main.js

# PM2 설정 저장 (선택사항, startup 설정을 해놨다면)
pm2 save