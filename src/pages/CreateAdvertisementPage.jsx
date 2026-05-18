import { useState } from "react";
import { advertisementService } from "../services/advertisementService";

// CreateAdvertisementPage - formulär för att skapa en ny annons
export default function CreateAdvertisementPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "Lost",
    contactPhoneNumber: "",
    contactEmail: "",

    cat: {
      name: "",
      breed: "",
      furColor: "",
    },

    location: {
      city: "",
      area: "",
    },
  });

  function updateField(e) {
    const { name, value } = e.target;

    // Hantera cat.*
    if (name.startsWith("cat.")) {
      const field = name.split(".")[1];

      setForm((current) => ({
        ...current,
        cat: {
          ...current.cat,
          [field]: value,
        },
      }));

      return;
    }

    // Hantera location.*
    if (name.startsWith("location.")) {
      const field = name.split(".")[1];

      setForm((current) => ({
        ...current,
        location: {
          ...current.location,
          [field]: value,
        },
      }));

      return;
    }

    // Hantera vanliga fields
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await advertisementService.create({
        ...form,
        type: form.type === "Lost" ? 0 : 1,

      });

      alert("Annons skapad!");

      // Återställ formulär
      setForm({
        title: "",
        description: "",
        type: "Lost",
        contactPhoneNumber: "",
        contactEmail: "",

        cat: {
          name: "",
          breed: "",
          furColor: "",
        },

        location: {
          city: "",
          area: "",
        },
      });
    } catch (error) {
      console.error(error);
      alert("Kunde inte skapa annons.");
    }
  }

  return (
    <section className="page">
      <h1>Skapa annons</h1>

      <form className="form" onSubmit={handleSubmit}>
        <input
          className="input"
          name="title"
          placeholder="Titel"
          value={form.title}
          onChange={updateField}
        />

        <textarea
          className="input"
          name="description"
          placeholder="Beskrivning"
          value={form.description}
          onChange={updateField}
        />

        <select
          className="input"
          name="type"
          value={form.type}
          onChange={updateField}
        >
          <option value="Lost">Försvunnen katt</option>
          <option value="Found">Upphittad katt</option>
        </select>

        <input
          className="input"
          name="cat.name"
          placeholder="Kattens namn"
          value={form.cat.name}
          onChange={updateField}
        />

        <input
          className="input"
          name="cat.breed"
          placeholder="Ras"
          value={form.cat.breed}
          onChange={updateField}
        />

        <input
          className="input"
          name="cat.furColor"
          placeholder="Pälsfärg"
          value={form.cat.furColor}
          onChange={updateField}
        />

        <input
          className="input"
          name="location.city"
          placeholder="Stad"
          value={form.location.city}
          onChange={updateField}
        />

        <input
          className="input"
          name="location.area"
          placeholder="Område"
          value={form.location.area}
          onChange={updateField}
        />

        <input
          className="input"
          name="contactPhoneNumber"
          placeholder="Telefonnummer"
          value={form.contactPhoneNumber}
          onChange={updateField}
        />

        <input
          className="input"
          name="contactEmail"
          placeholder="Email"
          value={form.contactEmail}
          onChange={updateField}
        />

        <button className="btn">Skapa annons</button>
      </form>
    </section>
  );
}