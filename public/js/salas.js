
    let rooms = [];
    let cinemas = [];
    const API_BASE = "http://localhost:3000/rooms";
    const CINEMAS_API = "http://localhost:3000/cinemas";
    const token = localStorage.getItem("authToken");

    if (!token) {
        Swal.fire({
            icon: "warning",
            title: "⚠️ Debes iniciar sesión primero",
            confirmButtonText: "Ir a login",
        }).then(() => {
            window.location.href = "login.html";
        });
    }

    const roomsTable = document.getElementById("roomsTable");
    const roomsBody = document.getElementById("roomsBody");
    const loading = document.getElementById("loading");
    const modal = document.getElementById("roomModal");
    const roomForm = document.getElementById("roomForm");
    const createRoomBtn = document.getElementById("createRoomBtn");
    const closeBtn = document.querySelector(".close");
    const cinemaFilter = document.getElementById("cinemaFilter");

    document.addEventListener("DOMContentLoaded", () => {
        loadCinemas().then(() => loadRooms());
    });

    // --- CARGAR CINES ---
    async function loadCinemas() {
        try {
            const response = await fetch(CINEMAS_API, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Error al cargar cines");

            const data = await response.json();
            cinemas = Array.isArray(data) ? data : (data.cinemas || data.data || []);

            const cinemaSelect = document.getElementById("cinemaId");
            const filterSelect = document.getElementById("cinemaFilter");

            cinemaSelect.innerHTML = '<option value="">Seleccionar cine...</option>';
            filterSelect.innerHTML = '<option value="">Todos los cines</option>';

            cinemas.forEach((cinema) => {
                const opt = `<option value="${cinema._id || cinema.id}">
                                ${cinema.name} - ${cinema.city}
                             </option>`;
                cinemaSelect.innerHTML += opt;
                filterSelect.innerHTML += opt;
            });
        } catch (error) {
            console.error("❌ Error al cargar cines:", error);
            Swal.fire({
                icon: "error",
                title: "Error de conexión",
                text: "No se pudo conectar al servidor de cines. Asegúrate de que tu servidor esté en ejecución.",
            });
        }
    }

    // --- CARGAR SALAS ---
    async function loadRooms() {
        roomsTable.style.display = "none";
        loading.style.display = "block";
        roomsBody.innerHTML = "";
        try {
            const response = await fetch(API_BASE, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                if (response.status === 401) {
                    handleUnauthorized();
                }
                throw new Error("Error del servidor: " + response.statusText);
            }

            const data = await response.json();
            console.log("✅ Datos recibidos del servidor:", data);

            rooms = Array.isArray(data) ? data : (data.rooms || []);

            renderRooms();
        } catch (error) {
            console.error("❌ Error al cargar salas:", error);
            loading.innerHTML = "❌ Error al cargar salas. Asegúrate de que tu servidor esté en ejecución y la ruta sea correcta.";
        }
    }

    // --- RENDERIZAR TABLA ---
    function renderRooms() {
        console.log("Salas cargadas:", rooms);
        console.log("Cines cargados:", cinemas);

        roomsBody.innerHTML = "";
        const filteredRooms = filterRoomsByCinema();
        console.log("Salas filtradas:", filteredRooms);

        if (filteredRooms.length === 0) {
            roomsBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center;padding:40px;color:white;">
                        🎬 No hay salas registradas<br>
                        <small>Haz clic en "Crear Nueva Sala" para comenzar</small>
                    </td>
                </tr>
            `;
        } else {
            filteredRooms.forEach(room => {
                const cinema = cinemas.find(c =>
                    String(c._id) === String(room.cinemaId) || String(c.id) === String(room.cinemaId)
                );

                console.log("Comparando sala:", room, "-> cine encontrado:", cinema);

                const cinemaName = cinema ? cinema.name : "N/A";
                const cinemaCity = cinema ? cinema.city : "N/A";

                roomsBody.innerHTML += `
                    <tr>
                        <td>${room.code || "N/A"}</td>
                        <td>${room.numSeats || 0}</td>
                        <td>${cinemaName}</td>
                        <td>${cinemaCity}</td>
                        <td>
                            <button class="action-button edit-button" onclick="editRoom('${room._id}')">Editar</button>
                            <button class="action-button delete-button" onclick="deleteRoom('${room._id}')">Eliminar</button>
                        </td>
                    </tr>
                `;
            });
        }

        roomsTable.style.display = "table";
        loading.style.display = "none";
    }

    // --- FILTRAR POR CINE ---
    function filterRoomsByCinema() {
        const selectedCinemaId = cinemaFilter.value;
        if (!selectedCinemaId) {
            return rooms;
        }
        return rooms.filter(room =>
            String(room.cinemaId) === String(selectedCinemaId) ||
            (room.cinema && String(room.cinema._id) === String(selectedCinemaId))
        );
    }

    // --- EVENTOS ---
    createRoomBtn.addEventListener("click", () => openModal());
    closeBtn.addEventListener("click", () => closeModal());
    roomForm.addEventListener("submit", handleFormSubmit);
    cinemaFilter.addEventListener("change", () => renderRooms());

    // --- MODAL ---
    function openModal(room = null) {
        document.getElementById("modalTitle").textContent = room ? "Editar Sala" : "Crear Nueva Sala";
        document.getElementById("roomId").value = room ? (room._id || room.id) : "";

        if (room) {
            document.getElementById("code").value = room.code || "";
            document.getElementById("numSeats").value = room.numSeats || 0;
            document.getElementById("cinemaId").value =
                room.cinemaId || (room.cinema ? (room.cinema._id || room.cinema.id) : "");
        } else {
            roomForm.reset();
        }
        modal.style.display = "block";
    }

    function closeModal() {
        modal.style.display = "none";
        roomForm.reset();
    }

    // --- CREAR/EDITAR ---
    async function handleFormSubmit(e) {
        e.preventDefault();
        const roomId = document.getElementById("roomId").value;
        const roomData = {
            code: document.getElementById("code").value.trim(),
            numSeats: parseInt(document.getElementById("numSeats").value),
            cinemaId: document.getElementById("cinemaId").value,
        };

        try {
            let url = roomId ? `${API_BASE}/${roomId}` : API_BASE;
            const method = roomId ? "PUT" : "POST";
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(roomData),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Error al guardar la sala");

            Swal.fire({
                icon: "success",
                title: "Sala guardada",
                text: `La sala "${result.room?.code || roomData.code}" fue guardada correctamente.`,
            });

            closeModal();
            loadRooms();
        } catch (error) {
            Swal.fire({ icon: "error", title: "❌ Error", text: error.message });
        }
    }

    // --- EDITAR ---
    async function editRoom(id) {
        const room = rooms.find(r => r._id === id || r.id === id);
        if (room) {
            openModal(room);
        } else {
            Swal.fire({ icon: "error", title: "Error", text: "No se encontró la sala para editar." });
        }
    }

    // --- ELIMINAR ---
    async function deleteRoom(id) {
        Swal.fire({
            title: "¿Estás seguro?",
            text: "No podrás revertir esto!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`${API_BASE}/${id}`, {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!response.ok) {
                        const result = await response.json();
                        throw new Error(result.message || "Error al eliminar la sala");
                    }
                    Swal.fire("Eliminada!", "La sala ha sido eliminada.", "success");
                    loadRooms();
                } catch (error) {
                    Swal.fire({ icon: "error", title: "Error", text: error.message });
                }
            }
        });
    }

    // --- SESIÓN EXPIRADA ---
    function handleUnauthorized() {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userRole");
        Swal.fire({
            icon: "error",
            title: "Sesión expirada",
            text: "Tu sesión ha expirado. Por favor, inicia sesión de nuevo.",
        }).then(() => {
            window.location.href = "login.html";
        });
    }

    // Exportar funciones para HTML
    window.editRoom = editRoom;
    window.deleteRoom = deleteRoom;
    window.closeModal = closeModal;
