REQUIREMENTS 
- dockers

RUN
- create .env file with values
    DB_USER=
    DB_PASSWORD=
    DB_NAME=
    GEMINI_API_KEY=
- run the container using "docker compose up --build -d" 


FRONTEND REF DOCS
-https://tanstack.com/query/latest/docs/framework/react/reference/useQuery
  //https://tanstack.com/query/v5/docs/framework/react/guides/queries
//https://tanstack.com/query/v4/docs/framework/react/reference/useMutation  
//https://tanstack.com/query/latest/docs/framework/react/quick-start


BACKEND REF DOCS
- EXPRESS.JS DEFINING TYPES // https://www.npmjs.com/package/@types/express?activeTab=readme
- SETTING UP ORM //https://orm.drizzle.team/docs/get-started/postgresql-new
- QUEUING WITH BULL MQ /https://www.npmjs.com/package/bullmq
- TEXT GENERATION WITH AI  //https://ai.google.dev/gemini-api/docs/text-generation
- DOCR IMAGE FOR PLAYWRIGHT https://www.postgresql.org/message-id/CAFOeHx1wpqRLcs8jSDar-Em3F3ogSetV8sJPZnDMEehc_3XWuQ%40mail.gmail.com


SYSTEM ARCHITECTURE
- docker commpose starts 6 containers redis,postgres,db-migrate,frontend, api and worker. and it also sets up the  
  env variables in each container
- db-migrate container will stop after migration is done since its task based and others will keep on running since   
  they are service based
- front-end will run on localhost:3000 and backend on localhost:4000
- frontnd will send api request to localhost:4000 .local host will send request to other containers using dockers 
  internal network 
- since frontend is running on client side i.e browser . it doesnt have access to dockers network thus we are 
  forwwarding request to localhost:4000 for backend access



