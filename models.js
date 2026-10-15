import Groq from "groq-sdk";

const GROQ_API_KEY=process.env.GROQ_API_KEY
const groq = new Groq({ apiKey:GROQ_API_KEY });
console.log(GROQ_API_KEY)
const getModels = async () => {
  return await groq.models.list();
};


getModels().then((models) => {
  const list=models.data
  console.log("list:",list);
  const hello=list.map(i=>[i.name,i?.hugging_face_id || "not there"])
  console.log(hello)
});
