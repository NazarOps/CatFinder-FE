import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import CommentSection from "../components/comments/CommentSection";
import { advertisementService } from "../services/advertisementService";
import { commentService } from "../services/commentService";
import { useAuthStore } from "../store/authStore";
export default function AdvertisementDetailsPage(){
    const {id}=useParams();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const [advertisement,setAdvertisement]=useState(null);
    const [comments,setComments]=useState([]);useEffect(()=>{async function load(){try{setAdvertisement(await advertisementService.getById(id));setComments(await commentService.getByAdvertisement(id))}catch{setAdvertisement({advertisementId:id,title:"Demo-annons",description:"Backend är inte kopplad ännu.",contactPhoneNumber:"070-000 00 00",contactEmail:"demo@example.com",location:{city:"Göteborg",area:"Majorna"},cat:{name:"Misse",breed:"Okänd",furColor:"Grå"}})}}load()},[id]);async function handleCreateComment(payload){if(!isAuthenticated){alert("Du måste logga in för att kommentera.");return;}const created=await commentService.create(id,payload);setComments((current)=>[...current,created])}if(!advertisement)return <section className="page">Laddar...</section>;return <section className="page grid"><article className="card"><h1>{advertisement.title}</h1><p>{advertisement.description}</p><h2>Katt</h2><p>Namn: {advertisement.cat?.name ?? "Okänt"}</p><p>Ras: {advertisement.cat?.breed ?? "Okänd"}</p><p>Pälsfärg: {advertisement.cat?.furColor ?? "Okänd"}</p><h2>Plats</h2><p>{advertisement.location?.city} {advertisement.location?.area}</p><h2>Kontakt</h2><p>Telefon: {advertisement.contactPhoneNumber ?? "Ej angivet"}</p><p>Email: {advertisement.contactEmail ?? "Ej angivet"}</p></article><CommentSection comments={comments} onSubmit={handleCreateComment}/></section>}
