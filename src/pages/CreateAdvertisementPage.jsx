import { useState } from "react";
import { advertisementService } from "../services/advertisementService";
import { advertisementImageService } from "../services/advertisementImageService";
import { posterService } from "../services/posterService";
import { useAuthStore } from "../store/authStore";

// CreateAdvertisementPage - formular for att skapa en ny annons
export default function CreateAdvertisementPage() {
  const user = useAuthStore((state) => state.user);

  const cityAreas = {
    Stockholm:    ["Sodermalm","Ostermalm","Kungsholmen","Vasastan","Norrmalm","Bromma","Spanga","Tensta","Rinkeby","Kista","Skarholmen","Liljeholmen","Hagersten","Alvsjo","Enskede","Arsta","Farsta","Skarpnack","Ragsved","Vallingby","Hasselby","Djurgarden","Lidingo","Nacka","Sollentuna"],
    Goteborg:     ["Centrum","Majorna","Linnestaden","Hisingen","Orgryte","Harlanda","Bergsjon","Kortedala","Larjedalen","Lundby","Askim","Frolunda","Hogsbo","Biskopsgarden","Backa","Angered"],
    Malmo:        ["Centrum","Limhamn","Husie","Hyllie","Kirseberg","Oxie","Rosengard","Sodra innerstaden","Vastra innerstaden","Fosie","Bunkeflostrand"],
    Uppsala:      ["Centrum","Luthagen","Eriksberg","Gottsunda","Savja","Haga","Linnestaden","Stabby","Valsatra","Sunnersta"],
    Linkoping:    ["Centrum","Ryd","Skaggetorp","Berga","Lambohov","Hjulsbro","Innerstaden","Vasastaden","Johannelund"],
    Orebro:       ["Centrum","Adolfsberg","Baronbackarna","Brickeberg","Eyra","Oxhagen","Varberga","Vivalla","Hagaby"],
    Vasteras:     ["Centrum","Hamre","Haga","Irsta","Pettersberg","Raby","Skultuna","Vasteras Centrum"],
    Helsingborg:  ["Centrum","Dalhem","Fredriksdal","Hogaborg","Miatorp","Narlunda","Raa","Soder","Tagaborg"],
    Norrkoping:   ["Centrum","Hageby","Klockaretorpet","Ljura","Marielund","Soder","Ostra"],
    Jonkoping:    ["Centrum","Huskvarna","Raslatt","Oxnehaga","Norrahammar","Barnarp"],
    Lund:         ["Centrum","Norra Faladen","Klostergarden","Linero","Kobjer","Martens Falad","Varpinge"],
    Umea:         ["Centrum","Haga","Mariehem","Sandbacka","Tomtebo","Alidhem","Backen"],
    Gavle:        ["Centrum","Satra","Bomhus","Hemlingby","Andersberg","Naringen"],
    Boras:        ["Centrum","Norrby","Hassleholmen","Sjobo","Hulta","Gota"],
    Eskilstuna:   ["Centrum","Froslunda","Skiftinge","Lagersberg","Rabergstorp","Torshalla"],
    Karlstad:     ["Centrum","Orrholmen","Valsviken","Gruvlyckan","Kronoparken","Farjestad"],
    Sundsvall:    ["Centrum","Sidsjo","Skonsberg","Njurunda","Timra","Skonsmon"],
    Lulea:        ["Centrum","Bergnaset","Bjorkskatan","Hertson","Ranea","Gammelstad"],
    Halmstad:     ["Centrum","Andersberg","Sondrum","Villsharad","Oskarstrom","Getinge"],
    Vaxjo:        ["Centrum","Araby","Dalbo","Hovshaga","Soder","Teleborg"],
    Ostersund:    ["Centrum","Froson","Lugnvik","Odenskog","Torvalla"],
    Kalmar:       ["Centrum","Norrliden","Oxhagen","Tallhagen","Tegelviken"],
    Kristianstad: ["Centrum","Gamlegarden","Nasby","Charlottesborg","Va"],
    Falun:        ["Centrum","Halsinggarden","Hosjo","Kallviken","Lugnet"],
    Borlange:     ["Centrum","Jakobsgardarna","Kvarnsveden","Sater","Tunabygden"],
    Karlskrona:   ["Centrum","Bergasa","Lyckeby","Pottholmen","Rosenholm"],
    Skovde:       ["Centrum","Haggum","Ryd","Timmersdala","Varsas"],
    Sodertalje:   ["Centrum","Hovsjo","Jarna","Lina","Ronna","Saltskog"],
    Trollhattan:  ["Centrum","Kronogarden","Lextorp","Sjuntorp","Velanda"],
    Taby:         ["Centrum","Arninge","Gribbylund","Nasby Park","Viggbyholm"],
  };
  const [images, setImages] = useState([]);
  const MAX_IMAGES = 5;
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [posterDragOver, setPosterDragOver] = useState(false);
  const [posterAnalyzing, setPosterAnalyzing] = useState(false);
  const [posterMessage, setPosterMessage] = useState(null);

  const VALID_CITIES = Object.keys(cityAreas);
  const VALID_FUR_COLORS = ["Svart", "Vit", "Gra", "Orange", "Brun", "Beige", "Rodbrun", "Blagra", "Calico"];

  async function analyzePoster(file) {
    if (!file || !file.type.startsWith("image/")) {
      setPosterMessage({ type: "error", text: "Filen maste vara en bild (JPG, PNG, WebP, GIF)" });
      return;
    }
    setPosterAnalyzing(true);
    setPosterMessage(null);
    try {
      const result = await posterService.analyze(file);
      const filled = [];

      setForm(prev => {
        const next = { ...prev, cat: { ...prev.cat }, location: { ...prev.location } };

        if (result.title)       { next.title = result.title; }
        if (result.description) { next.description = result.description; }
        if (result.type === "Lost" || result.type === "Found") { next.type = result.type; }
        if (result.catName)     { next.cat.name  = result.catName; }
        if (result.catBreed)    { next.cat.breed = result.catBreed; }
        if (result.catFurColor && VALID_FUR_COLORS.includes(result.catFurColor)) {
          next.cat.furColor = result.catFurColor;
        }
        if (result.city && VALID_CITIES.includes(result.city)) {
          next.location.city = result.city;
          next.location.area = "";
        }
        if (result.contactPhoneNumber) { next.contactPhoneNumbers = [result.contactPhoneNumber]; }
        if (result.contactEmail)       { next.contactEmails = [result.contactEmail]; }

        return next;
      });

      if (result.title)        filled.push("Titel");
      if (result.description)  filled.push("Beskrivning");
      if (result.type === "Lost" || result.type === "Found") filled.push("Typ");
      if (result.catName)      filled.push("Kattens namn");
      if (result.catBreed)     filled.push("Ras");
      if (result.catFurColor && VALID_FUR_COLORS.includes(result.catFurColor)) filled.push("Palsfarg");
      if (result.city && VALID_CITIES.includes(result.city)) filled.push("Stad");
      if (result.contactPhoneNumber) filled.push("Telefon");
      if (result.contactEmail)       filled.push("Email");

      if (filled.length > 0) {
        setPosterMessage({ type: "success", text: `Fyllde i: ${filled.join(", ")}` });
      } else {
        setPosterMessage({ type: "warn", text: "Kunde inte hitta tillrackligt med information i affischen." });
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || "Analysen misslyckades. Forsok igen.";
      setPosterMessage({ type: "error", text: msg });
    } finally {
      setPosterAnalyzing(false);
    }
  }

  function validate() {
    const errs = {};
    if (!form.title.trim())       errs.title    = "Titel kravs";
    if (!form.description.trim()) errs.description = "Beskrivning kravs";
    if (!form.cat.furColor)       errs.furColor = "Valj en palsfarg";
    if (!form.location.city)      errs.city     = "Valj en stad";
    const phone = form.contactPhoneNumbers.find(p => p.trim());
    if (phone && !/^\+?[\d\s\-()­]{7,20}$/.test(phone.trim())) {
      errs.phone = "Ange ett giltigt telefonnummer";
    }
    return errs;
  }

  const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

  function extractErrorMessage(error, fallback = "Okant fel") {
    const data = error?.response?.data;
    const validationErrors = data?.errors;

    if (Array.isArray(validationErrors) && validationErrors.length > 0) {
      return validationErrors.join("\n");
    }

    if (typeof data === "string" && data.trim()) {
      return data;
    }

    if (typeof data?.title === "string" && data.title.trim()) {
      return data.title;
    }

    if (typeof data?.error === "string" && data.error.trim()) {
      return data.error;
    }

    if (typeof error?.message === "string" && error.message.trim()) {
      return error.message;
    }

    return fallback;
  }

  function handleImageAdd(e) {
    const files = Array.from(e.target.files);
    const unsupported = files.filter((file) => {
      const contentType = file.type?.toLowerCase();
      return !contentType || !ACCEPTED_TYPES.includes(contentType);
    });

    if (unsupported.length > 0) {
      const unsupportedNames = unsupported
        .map((file) => file.type ? `${file.name} (${file.type})` : file.name)
        .join(", ");

      alert(
        `Filformat stods ej: ${unsupportedNames}\n` +
        "Tillatna format: JPG, PNG, WebP, GIF.\n" +
        "HEIC/HEIF-bilder fran iPhone stods inte just nu."
      );
      e.target.value = "";
      return;
    }
    const slots = MAX_IMAGES - images.length;
    const toAdd = files.slice(0, slots).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages(current => [...current, ...toAdd]);
    e.target.value = "";
  }

  function handleImageRemove(index) {
    setImages(current => current.filter((_, i) => i !== index));
  }

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "Lost",
    contactPhoneNumbers: [""],
    contactEmails: [user?.email ?? ""],

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

  function clearError(key) {
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  }

  function updateField(e) {
    const { name, value } = e.target;

    if (name.startsWith("cat.")) {
      const field = name.split(".")[1];
      if (field === "furColor") clearError("furColor");
      setForm((current) => ({ ...current, cat: { ...current.cat, [field]: value } }));
      return;
    }

    if (name.startsWith("location.")) {
      const field = name.split(".")[1];
      if (field === "city") clearError("city");
      setForm((current) => ({
        ...current,
        location: { ...current.location, [field]: value, ...(field === "city" ? { area: "" } : {}) },
      }));
      return;
    }

    clearError(name);
    setForm((current) => ({ ...current, [name]: value }));
  }

  function addContactField(field) {
    setForm(c => ({ ...c, [field]: [...c[field], ""] }));
  }

  function removeContactField(field, index) {
    setForm(c => ({ ...c, [field]: c[field].filter((_, i) => i !== index) }));
  }

  function updateContactField(field, index, value) {
    if (field === "contactPhoneNumbers") clearError("phone");
    setForm(c => {
      const updated = [...c[field]];
      updated[index] = value;
      return { ...c, [field]: updated };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);
    try {
      const created = await advertisementService.create({
        title: form.title,
        description: form.description,
        type: form.type === "Lost" ? 0 : 1,
        contactPhoneNumber: form.contactPhoneNumbers.find(p => p.trim()) ?? null,
        contactEmail: form.contactEmails.find(e => e.trim()) ?? null,
        cat: {
          name: form.cat.name,
          breed: form.cat.breed,
          furColor: form.cat.furColor,
        },
        location: {
          city: form.location.city,
          area: form.location.area,
        },
      });

      let submissionMessage = "Annons skickad for granskning. Den blir synlig nar en admin har godkant den.";

      if (images.length > 0 && created?.advertisementId) {
        const uploadResults = await Promise.allSettled(
          images.map((img) => advertisementImageService.upload(created.advertisementId, img.file))
        );

        const failedUploads = uploadResults.flatMap((result, index) => {
          if (result.status === "fulfilled") {
            return [];
          }

          return [{
            fileName: images[index]?.file?.name || `Bild ${index + 1}`,
            message: extractErrorMessage(result.reason, "Uppladdningen misslyckades."),
          }];
        });

        if (failedUploads.length > 0) {
          const failureDetails = failedUploads
            .map((failure) => `- ${failure.fileName}: ${failure.message}`)
            .join("\n");

          submissionMessage =
            "Annonsen skickades for granskning, men en eller flera bilder kunde inte laddas upp.\n\n" +
            `${failureDetails}\n\n` +
            "Vanliga orsaker ar filformat som inte stods, till exempel HEIC/HEIF fran iPhone.";
        }
      }

      alert(submissionMessage);

      setImages([]);
      setForm({
        title: "",
        description: "",
        type: "Lost",
        contactPhoneNumbers: [""],
        contactEmails: [""],
        cat: { name: "", breed: "", furColor: "" },
        location: { city: "", area: "" },
      });
    } catch (error) {
      const message = extractErrorMessage(error, "Okant fel");
      alert("Kunde inte skapa annons:\n" + message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="page">
      {/* -- Poster Analysis Drop Zone (hidden until OpenAI key is configured) -- */}
      {false && <div style={{ maxWidth: 700, marginBottom: 24 }}>
        <label
          onDragOver={e => { e.preventDefault(); setPosterDragOver(true); }}
          onDragLeave={() => setPosterDragOver(false)}
          onDrop={e => {
            e.preventDefault();
            setPosterDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) analyzePoster(file);
          }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "28px 24px",
            border: `2px dashed ${posterDragOver ? "#f97316" : "#dcc5b0"}`,
            borderRadius: 16,
            background: posterDragOver ? "#fff7ed" : "#faf5f0",
            cursor: posterAnalyzing ? "default" : "pointer",
            transition: "border-color 0.15s, background 0.15s",
          }}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: "none" }}
            disabled={posterAnalyzing}
            onChange={e => {
              const file = e.target.files[0];
              e.target.value = "";
              if (file) analyzePoster(file);
            }}
          />
          <span style={{ fontSize: "2rem" }}>[poster]</span>
          {posterAnalyzing ? (
            <span style={{ fontWeight: 600, color: "#f97316" }}>Analyserar affisch...</span>
          ) : (
            <>
              <span style={{ fontWeight: 600, color: "#5c3622" }}>Dra och slapp en forsvunnen-katt-affisch har</span>
              <span style={{ fontSize: "0.82rem", color: "#9ca3af" }}>eller klicka for att valja en bild - Claude AI fyller i formularet at dig</span>
            </>
          )}
        </label>

        {posterMessage && (
          <p style={{
            marginTop: 10,
            padding: "10px 14px",
            borderRadius: 10,
            fontSize: "0.85rem",
            fontWeight: 500,
            background: posterMessage.type === "success" ? "#f0fdf4"
              : posterMessage.type === "warn" ? "#fffbeb"
              : "#fef2f2",
            color: posterMessage.type === "success" ? "#166534"
              : posterMessage.type === "warn" ? "#92400e"
              : "#991b1b",
            border: `1px solid ${posterMessage.type === "success" ? "#bbf7d0"
              : posterMessage.type === "warn" ? "#fde68a"
              : "#fecaca"}`,
          }}>
            {posterMessage.text}
          </p>
        )}
      </div>}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 24, maxWidth: 700 }}>

        {/* -- Katt-kort -- */}
        <article className="card" style={{ display: "grid", gap: 18 }}>
          <h2 style={{
            margin: "-24px -24px 0 -24px",
            background: "#f5ede4",
            borderBottom: "1px solid #dcc5b0",
            borderRadius: "23px 23px 0 0",
            padding: "16px 24px",
            fontSize: "1rem",
            fontWeight: 700,
            color: "#5c3622",
          }}>Om katten</h2>

          {/* Bilder langst upp */}
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 8, color: "#374151" }}>
              Bilder pa katten{" "}
              <span style={{ fontWeight: 400, color: "#9ca3af", fontSize: "0.85rem" }}>
                ({images.length}/{MAX_IMAGES})
              </span>
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {images.map((img, i) => (
                <div key={i} style={{ position: "relative", width: 110, height: 110, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
                  <img src={img.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button
                    type="button"
                    onClick={() => handleImageRemove(i)}
                    style={{
                      position: "absolute", top: 4, right: 4,
                      width: 22, height: 22, borderRadius: "50%",
                      background: "rgba(0,0,0,0.55)", color: "white",
                      border: "none", cursor: "pointer", fontSize: "0.75rem",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >x</button>
                </div>
              ))}

              {images.length < MAX_IMAGES && (
                <label style={{
                  width: 110, height: 110, borderRadius: 12, flexShrink: 0,
                  background: "#fff7ed", border: "2px dashed #fed7aa",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                }}>
                  <span className="btn btn-orange" style={{ padding: "8px 14px", fontSize: "0.8rem", gap: 4, pointerEvents: "none" }}>
                    <span>+</span> Valj bild
                  </span>
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={handleImageAdd} style={{ display: "none" }} />
                </label>
              )}
            </div>
          </div>

          <select className="input" name="type" value={form.type} onChange={updateField}>
            <option value="Lost">Forsvunnen katt</option>
            <option value="Found">Upphittad katt</option>
          </select>

          <div>
            <input className="input" name="title" placeholder="Titel" value={form.title} onChange={updateField} style={errors.title ? { borderColor: "#ef4444" } : {}} />
            {errors.title && <span style={{ color: "#ef4444", fontSize: "0.8rem" }}>{errors.title}</span>}
          </div>

          <div>
            <textarea className="input" name="description" placeholder="Beskrivning" value={form.description} onChange={updateField} style={errors.description ? { borderColor: "#ef4444" } : {}} />
            {errors.description && <span style={{ color: "#ef4444", fontSize: "0.8rem" }}>{errors.description}</span>}
          </div>

          <input className="input" name="cat.name" placeholder="Kattens namn" value={form.cat.name} onChange={updateField} />

          <input className="input" name="cat.breed" placeholder="Ras" value={form.cat.breed} onChange={updateField} />

          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 8, color: "#374151" }}>
              Palsfarg{form.cat.furColor && <span style={{ marginLeft: 8, fontWeight: 400, color: "#6b7280" }}>- {form.cat.furColor}</span>}
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {[
                { name: "Svart",   hex: "#1c1c1c" },
                { name: "Vit",     hex: "#f5f5f0" },
                { name: "Gra",     hex: "#9ca3af" },
                { name: "Orange",  hex: "#f97316" },
                { name: "Brun",    hex: "#92400e" },
                { name: "Beige",   hex: "#fde68a" },
                { name: "Rodbrun", hex: "#b45309" },
                { name: "Blagra",  hex: "#6b7280" },
                { name: "Calico",  hex: "linear-gradient(135deg,#f97316 33%,#1c1c1c 33%,#1c1c1c 66%,#f5f5f0 66%)" },
              ].map(({ name, hex }) => (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => setForm(c => ({ ...c, cat: { ...c.cat, furColor: name } }))}
                  style={{
                    width: 36, height: 36, borderRadius: "50%", background: hex, cursor: "pointer",
                    border: form.cat.furColor === name ? "3px solid #f97316" : "2px solid #d1d5db",
                    outline: form.cat.furColor === name ? "2px solid #fed7aa" : "none",
                    outlineOffset: 1,
                  }}
                />
              ))}
            </div>
            {errors.furColor && <span style={{ color: "#ef4444", fontSize: "0.8rem" }}>{errors.furColor}</span>}
          </div>
        </article>

        {/* -- Plats & Kontakt-kort -- */}
        <article className="card" style={{ display: "grid", gap: 18 }}>
          <h2 style={{
            margin: "-24px -24px 0 -24px",
            background: "#f5ede4",
            borderBottom: "1px solid #dcc5b0",
            borderRadius: "23px 23px 0 0",
            padding: "16px 24px",
            fontSize: "1rem",
            fontWeight: 700,
            color: "#5c3622",
          }}>Plats & Kontakt</h2>

          <div>
          <select className="input" name="location.city" value={form.location.city} onChange={updateField} style={errors.city ? { borderColor: "#ef4444" } : {}}>
            <option value="">Valj stad...</option>
            <option>Stockholm</option>
            <option>Goteborg</option>
            <option>Malmo</option>
            <option>Uppsala</option>
            <option>Linkoping</option>
            <option>Orebro</option>
            <option>Vasteras</option>
            <option>Helsingborg</option>
            <option>Norrkoping</option>
            <option>Jonkoping</option>
            <option>Lund</option>
            <option>Umea</option>
            <option>Gavle</option>
            <option>Boras</option>
            <option>Eskilstuna</option>
            <option>Sodertalje</option>
            <option>Karlstad</option>
            <option>Taby</option>
            <option>Vaxjo</option>
            <option>Halmstad</option>
            <option>Sundsvall</option>
            <option>Lulea</option>
            <option>Trollhattan</option>
            <option>Ostersund</option>
            <option>Borlange</option>
            <option>Falun</option>
            <option>Kalmar</option>
            <option>Kristianstad</option>
            <option>Skovde</option>
            <option>Karlskrona</option>
          </select>
          {errors.city && <span style={{ color: "#ef4444", fontSize: "0.8rem" }}>{errors.city}</span>}
          </div>
          <select
            className="input"
            name="location.area"
            value={form.location.area}
            onChange={updateField}
            disabled={!form.location.city}
          >
            <option value="">
              {form.location.city ? "Valj omrade..." : "Valj en stad forst"}
            </option>
            {(cityAreas[form.location.city] ?? []).map((area) => (
              <option key={area}>{area}</option>
            ))}
          </select>
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label style={{ fontWeight: 600, color: "#374151" }}>Telefonnummer</label>
              <button
                type="button"
                onClick={() => addContactField("contactPhoneNumbers")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "0.82rem", fontWeight: 500, padding: 0 }}
              >+ Lagg till fler...</button>
            </div>
            {form.contactPhoneNumbers.map((phone, i) => (
              <div key={i} style={{ display: "flex", gap: 8 }}>
                <input
                  className="input"
                  placeholder="Telefonnummer"
                  value={phone}
                  onChange={e => updateContactField("contactPhoneNumbers", i, e.target.value)}
                  style={{ flex: 1, ...(errors.phone && i === 0 ? { borderColor: "#ef4444" } : {}) }}
                />
                {form.contactPhoneNumbers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeContactField("contactPhoneNumbers", i)}
                    style={{
                      flexShrink: 0, width: 40, height: 40, borderRadius: "50%",
                      border: "1px solid #e5e7eb", background: "white", cursor: "pointer",
                      fontSize: "0.85rem", color: "#9ca3af",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >x</button>
                )}
              </div>
            ))}
            {errors.phone && <span style={{ color: "#ef4444", fontSize: "0.8rem" }}>{errors.phone}</span>}
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label style={{ fontWeight: 600, color: "#374151" }}>Email</label>
              <button
                type="button"
                onClick={() => addContactField("contactEmails")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "0.82rem", fontWeight: 500, padding: 0 }}
              >+ Lagg till fler...</button>
            </div>
            {form.contactEmails.map((email, i) => (
              <div key={i} style={{ display: "flex", gap: 8 }}>
                <input
                  className="input"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => updateContactField("contactEmails", i, e.target.value)}
                  style={{ flex: 1 }}
                />
                {form.contactEmails.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeContactField("contactEmails", i)}
                    style={{
                      flexShrink: 0, width: 40, height: 40, borderRadius: "50%",
                      border: "1px solid #e5e7eb", background: "white", cursor: "pointer",
                      fontSize: "0.85rem", color: "#9ca3af",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >x</button>
                )}
              </div>
            ))}
          </div>
        </article>

        <button
          className="btn btn-orange"
          style={{ justifySelf: "start", padding: "14px 32px", opacity: isSubmitting ? 0.6 : 1 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Skapar annons..." : "Skapa annons"}
        </button>

      </form>
    </section>
  );
}



