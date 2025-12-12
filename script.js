document.addEventListener('DOMContentLoaded', () => {   
    // ==========================================
    // 1. ESTADO DE LA APLICACIÓN
    // ==========================================
    let gastos = [
        {
            id: 1,
            descripcion: "Cena Restaurante Italiano",
            fecha: "2025-11-13",
            cantidad: 75.50,
            pagador: "Curro",
            participantes: ["Curro", "Lucas", "María"]
        },
        {
            id: 2,
            descripcion: "Gasolina Ida",
            fecha: "2025-11-10",
            cantidad: 45.00,
            pagador: "Lucas",
            participantes: ["Curro", "Lucas", "María"]
        },
        {
            id: 3,
            descripcion: "Compra Supermercado",
            fecha: "2025-11-11",
            cantidad: 32.15,
            pagador: "María",
            participantes: ["María", "Lucas"]
        }
    ];

    let amigos = ["Curro", "Lucas", "María"];
    let editandoId = null; 

    // ==========================================
    // 2. REFERENCIAS DOM
    // ==========================================
    const listaGastosContainer = document.getElementById('lista-gastos');
    const balanceContainer = document.getElementById('balance-container');
    
    // Modal Gasto
    const modalGasto = document.getElementById('modal-gasto');
    const btnAddGasto = document.getElementById('btn-add-gasto'); // Variable Correcta
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnCancel = document.getElementById('btn-cancelar');
    const formGasto = document.getElementById('form-gasto');
    const tituloModal = document.querySelector('#modal-gasto .modal-header h2');
    
    const selectPagador = document.getElementById('pagador');
    const containerParticipantes = document.getElementById('participantes-container');

    // Modal Amigo
    const modalAmigo = document.getElementById('modal-amigo');
    const btnAddAmigo = document.getElementById('btn-add-amigo');
    const btnCloseAmigo = document.getElementById('btn-close-amigo');
    const btnCancelAmigo = document.getElementById('btn-cancelar-amigo');
    const formAmigo = document.getElementById('form-amigo');

    // ==========================================
    // 3. GESTIÓN DE AMIGOS
    // ==========================================
    function updateFormOptions() {
        selectPagador.innerHTML = '';
        amigos.forEach(amigo => {
            const option = document.createElement('option');
            option.value = amigo;
            option.textContent = amigo;
            selectPagador.appendChild(option);
        });

        containerParticipantes.innerHTML = '';
        amigos.forEach(amigo => {
            const label = document.createElement('label');
            label.innerHTML = `<input type="checkbox" name="participantes" value="${amigo}" checked> ${amigo}`;
            containerParticipantes.appendChild(label);
        });
    }

    // ==========================================
    // 4. RENDERIZADO
    // ==========================================
    function renderGastos() {
        listaGastosContainer.innerHTML = ''; 

        if (gastos.length === 0) {
            listaGastosContainer.innerHTML = '<p class="empty-state">No hay gastos registrados.</p>';
            return;
        }

        const gastosOrdenados = [...gastos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        gastosOrdenados.forEach(gasto => {
            const article = document.createElement('article');
            article.className = 'gasto-item';
            const fechaFormateada = new Date(gasto.fecha).toLocaleDateString('es-ES');

            article.innerHTML = `
                <div class="gasto-header">
                    <h3>${gasto.descripcion}</h3>
                    <div class="gasto-precio-actions">
                        <span class="precio">${gasto.cantidad.toFixed(2)}€</span>
                        <div class="actions">
                            <button class="btn-icon edit" data-id="${gasto.id}" aria-label="Editar">✏️</button>
                            <button class="btn-icon delete" data-id="${gasto.id}" aria-label="Borrar">🗑️</button>
                        </div>
                    </div>
                </div>
                <div class="gasto-body">
                    <p><span class="label">Fecha:</span> <time datetime="${gasto.fecha}">${fechaFormateada}</time></p>
                    <p><span class="label">Pagado por:</span> <strong>${gasto.pagador}</strong></p>
                    <p><span class="label">Participantes:</span> ${gasto.participantes.join(', ')}</p>
                </div>
            `;
            listaGastosContainer.appendChild(article);
        });
        asignarEventosItems();
    }

    function renderBalance() {
        let saldos = {};
        amigos.forEach(amigo => saldos[amigo] = 0);

        gastos.forEach(gasto => {
            const pagador = gasto.pagador;
            const cantidad = gasto.cantidad;
            const participantes = gasto.participantes;
            if (saldos[pagador] !== undefined) {
                saldos[pagador] += cantidad;
            }
            const cuota = cantidad / participantes.length;
            participantes.forEach(participante => {
                if (saldos[participante] !== undefined) {
                    saldos[participante] -= cuota;
                }
            });
        });

        let deudores = [];
        let acreedores = [];
        for (const [nombre, saldo] of Object.entries(saldos)) {
            const saldoRedondeado = Math.round(saldo * 100) / 100;
            if (saldoRedondeado < -0.01) deudores.push({ nombre, cantidad: -saldoRedondeado });
            else if (saldoRedondeado > 0.01) acreedores.push({ nombre, cantidad: saldoRedondeado });
        }

        let deudas = [];
        let i = 0; let j = 0; 
        while (i < deudores.length && j < acreedores.length) {
            let deudor = deudores[i];
            let acreedor = acreedores[j];
            let monto = Math.min(deudor.cantidad, acreedor.cantidad);
            deudas.push({ de: deudor.nombre, a: acreedor.nombre, cantidad: monto });
            deudor.cantidad -= monto;
            acreedor.cantidad -= monto;
            if (Math.abs(deudor.cantidad) < 0.01) i++;
            if (Math.abs(acreedor.cantidad) < 0.01) j++;
        }

        balanceContainer.innerHTML = ''; 

        amigos.forEach(amigo => {
            const saldo = saldos[amigo] || 0;
            let claseEstado = 'neutro';
            let textoSaldo = `${saldo.toFixed(2)}€`;
            let detallesHTML = '';
            let itemsLista = '';

            if (saldo > 0.01) {
                claseEstado = 'positivo';
                textoSaldo = `+${saldo.toFixed(2)}€`;
                const misCobros = deudas.filter(d => d.a === amigo);
                misCobros.forEach(cobro => {
                    itemsLista += `<li class="cobrar">${cobro.de} le debe ${cobro.cantidad.toFixed(2)}€</li>`;
                });
            } else if (saldo < -0.01) {
                claseEstado = 'negativo';
                const misPagos = deudas.filter(d => d.de === amigo);
                misPagos.forEach(pago => {
                    itemsLista += `<li class="pagar">Debe ${pago.cantidad.toFixed(2)}€ a ${pago.a}</li>`;
                });
            } else {
                itemsLista = `<li>Estás al día</li>`;
            }

            detallesHTML = `<ul class="detalles-balance">${itemsLista}</ul>`;

            const card = document.createElement('article');
            card.className = `balance-card ${claseEstado}`;
            card.innerHTML = `
                <button class="btn-delete-friend" data-name="${amigo}" data-saldo="${Math.abs(saldo)}" aria-label="Eliminar amigo">🗑️</button>
                <h3>${amigo}</h3>
                <p class="cantidad">${textoSaldo}</p>
                ${detallesHTML}
            `;
            balanceContainer.appendChild(card);
        });

        document.querySelectorAll('.btn-delete-friend').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const nombre = e.target.dataset.name;
                const saldoAbs = parseFloat(e.target.dataset.saldo);
                borrarAmigo(nombre, saldoAbs);
            });
        });
    }

    // ==========================================
    // 5. INTERACCIONES
    // ==========================================
    function asignarEventosItems() {
        document.querySelectorAll('.btn-icon.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                abrirModalEdicion(id);
            });
        });
        document.querySelectorAll('.btn-icon.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                borrarGasto(id);
            });
        });
    }

    function borrarGasto(id) {
        if (confirm('¿Seguro que quieres borrar este gasto?')) {
            gastos = gastos.filter(g => g.id !== id);
            renderGastos();
            renderBalance();
        }
    }

    function abrirModalEdicion(id) {
        const gasto = gastos.find(g => g.id === id);
        if (!gasto) return;
        document.getElementById('desc').value = gasto.descripcion;
        document.getElementById('fecha').value = gasto.fecha;
        document.getElementById('precio').value = gasto.cantidad;
        document.getElementById('pagador').value = gasto.pagador;
        document.querySelectorAll('input[name="participantes"]').forEach(cb => {
            cb.checked = gasto.participantes.includes(cb.value);
        });
        editandoId = id;
        tituloModal.textContent = "Editar Gasto";
        modalGasto.showModal();
    }

    // --- LÓGICA MODAL AMIGO ---
    btnAddAmigo.addEventListener('click', () => {
        document.getElementById('nombre-amigo').value = '';
        modalAmigo.showModal();
    });
    const cerrarModalAmigo = () => modalAmigo.close();
    btnCloseAmigo.addEventListener('click', cerrarModalAmigo);
    btnCancelAmigo.addEventListener('click', cerrarModalAmigo);

    formAmigo.addEventListener('submit', (e) => {
        e.preventDefault();
        const nuevoNombre = document.getElementById('nombre-amigo').value.trim();
        if (nuevoNombre) {
            const existe = amigos.some(a => a.toLowerCase() === nuevoNombre.toLowerCase());
            if (existe) {
                alert("¡Ese amigo ya está en la lista!");
            } else {
                amigos.push(nuevoNombre);
                updateFormOptions();
                renderBalance();
                cerrarModalAmigo();
            }
        }
    });

    function borrarAmigo(nombre, saldoAbsoluto) {
        if (saldoAbsoluto > 0.01) {
            alert(`No puedes eliminar a ${nombre} porque tiene deudas pendientes (${saldoAbsoluto.toFixed(2)}€).`);
            return;
        }
        if (confirm(`¿Seguro que quieres eliminar a ${nombre} de la lista?`)) {
            amigos = amigos.filter(a => a !== nombre);
            updateFormOptions();
            renderBalance();
        }
    }

    // --- LÓGICA MODAL GASTO ---
    
    // CORRECCIÓN PRINCIPAL: Usamos la variable correcta 'btnAddGasto'
    btnAddGasto.addEventListener('click', () => {
        editandoId = null;
        tituloModal.textContent = "Nuevo Gasto";
        formGasto.reset();
        document.getElementById('fecha').valueAsDate = new Date();
        document.querySelectorAll('input[name="participantes"]').forEach(cb => cb.checked = true);
        modalGasto.showModal();
    });

    const cerrarModalGasto = () => {
        modalGasto.close();
        formGasto.reset();
        editandoId = null;
    };
    btnCloseModal.addEventListener('click', cerrarModalGasto);
    btnCancel.addEventListener('click', cerrarModalGasto);
    
    window.addEventListener('click', (e) => {
        if (e.target === modalGasto) cerrarModalGasto();
        if (e.target === modalAmigo) cerrarModalAmigo();
    });

    formGasto.addEventListener('submit', (e) => {
        e.preventDefault();
        const desc = document.getElementById('desc').value;
        const fecha = document.getElementById('fecha').value;
        const precio = parseFloat(document.getElementById('precio').value);
        const pagador = document.getElementById('pagador').value;
        const checkboxes = document.querySelectorAll('input[name="participantes"]:checked');
        const participantes = Array.from(checkboxes).map(cb => cb.value);

        if (participantes.length === 0) {
            alert("¡Debe haber al menos un participante!");
            return;
        }

        if (editandoId) {
            const index = gastos.findIndex(g => g.id === editandoId);
            if (index !== -1) {
                gastos[index] = {
                    id: editandoId, descripcion: desc, fecha: fecha, cantidad: precio, pagador: pagador, participantes: participantes
                };
            }
        } else {
            const nuevoGasto = {
                id: Date.now(), descripcion: desc, fecha: fecha, cantidad: precio, pagador: pagador, participantes: participantes
            };
            gastos.push(nuevoGasto);
        }
        renderGastos();
        renderBalance();
        cerrarModalGasto();
    });

    // ==========================================
    // 6. INICIALIZACIÓN
    // ==========================================
    // Ahora que el script no tiene errores, esto se ejecutará correctamente al inicio
    updateFormOptions(); 
    renderGastos();
    renderBalance();
});
