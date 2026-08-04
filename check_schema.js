const url = "https://qefoxpcfjjlcswqgjqtk.supabase.co/rest/v1/tor_projects?select=*&limit=1";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlZm94cGNmampsY3N3cWdqcXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4MzIwNDAsImV4cCI6MjA5OTQwODA0MH0.GuEXoCglXlPRwnT8r9pVMiS-sc26p8jBLb1NEKtAckM";

Promise.all([
  fetch(url, { headers: { 'apikey': key, 'Authorization': 'Bearer ' + key } }).then(res => res.json()),
  fetch("https://qefoxpcfjjlcswqgjqtk.supabase.co/rest/v1/tor_scores?select=*&limit=1", { headers: { 'apikey': key, 'Authorization': 'Bearer ' + key } }).then(res => res.json())
]).then(([projects, scores]) => {
  console.log('tor_projects schema:', projects[0]);
  console.log('tor_scores schema:', scores[0]);
}).catch(console.error);
