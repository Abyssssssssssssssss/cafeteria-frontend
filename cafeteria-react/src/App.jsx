import { useState, useEffect } from 'react';
import { api } from './api';
import './App.css';

function App() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados del formulario
  const [estudianteId, setEstudianteId] = useState('');
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  // Estado para controlar la edición
  const [editandoId, setEditandoId] = useState(null);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [resEst, resProd, resVen] = await Promise.all([
        api.get('/estudiantes'),
        api.get('/productos'),
        api.get('/ventas')
      ]);

      setEstudiantes(Array.isArray(resEst.data) ? resEst.data : []);
      setProductos(Array.isArray(resProd.data) ? resProd.data : []);
      setVentas(Array.isArray(resVen.data) ? resVen.data : []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setEstudiantes([]);
      setProductos([]);
      setVentas([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Cargar datos de la venta en el formulario para editar
  const seleccionarParaEditar = (venta) => {
    setEditandoId(venta.id);
    setEstudianteId(venta.estudiante_id || '');
    setProductoId(venta.producto_id || '');
    setCantidad(venta.cantidad);
    setFecha(venta.fecha ? venta.fecha.split('T')[0] : new Date().toISOString().split('T')[0]);
  };

  // Cancelar la edición actual
  const cancelarEdicion = () => {
    setEditandoId(null);
    setEstudianteId('');
    setProductoId('');
    setCantidad(1);
    setFecha(new Date().toISOString().split('T')[0]);
  };

  // Registrar nueva venta o actualizar existente
  const guardarVenta = async (e) => {
    e.preventDefault();
    if (!estudianteId || !productoId || cantidad <= 0) {
      alert('Por favor completa todos los campos.');
      return;
    }

    const payload = {
      estudiante_id: estudianteId,
      producto_id: productoId,
      cantidad: Number(cantidad),
      fecha
    };

    try {
      if (editandoId) {
        await api.put(`/ventas/${editandoId}`, payload);
        alert('Venta actualizada con éxito');
      } else {
        await api.post('/ventas', payload);
        alert('Venta registrada con éxito');
      }

      cancelarEdicion();
      cargarDatos();
    } catch (error) {
      console.error('Error al procesar la venta:', error);
      alert('Error al guardar los cambios.');
    }
  };

  const eliminarVenta = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta venta?')) return;
    try {
      await api.delete(`/ventas/${id}`);
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar venta:', error);
    }
  };

  return (
    <div className="container">
      <h1>Cafetería Escolar</h1>

      <section className="card">
        <h2>{editandoId ? `Editar Venta #${editandoId}` : 'Registrar Nueva Venta'}</h2>
        <form onSubmit={guardarVenta} className="form-grid">
          <div className="form-group">
            <label>Estudiante</label>
            <select value={estudianteId} onChange={(e) => setEstudianteId(e.target.value)} required>
              <option value="">Seleccionar...</option>
              {estudiantes.map((e) => (
                <option key={e.id} value={e.id}>{e.nombre} ({e.grupo})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Producto</label>
            <select value={productoId} onChange={(e) => setProductoId(e.target.value)} required>
              <option value="">Seleccionar...</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre} - ${p.precio}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Cantidad</label>
            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button type="submit" className="btn-primary">
              {editandoId ? 'Actualizar' : 'Guardar Venta'}
            </button>
            {editandoId && (
              <button type="button" onClick={cancelarEdicion} style={{ padding: '11px 14px', borderRadius: '6px', cursor: 'pointer', background: '#334155', color: '#fff', border: 'none' }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="card">
        <h2>Ventas de la Cafetería</h2>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Estudiante</th>
                <th>Producto</th>
                <th>Cant.</th>
                <th>Precio U.</th>
                <th>Total</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando datos del servidor...</td>
                </tr>
              ) : ventas.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No hay ventas registradas.</td>
                </tr>
              ) : (
                ventas.map((v) => (
                  <tr key={v.id}>
                    <td>{v.id}</td>
                    <td>{v.estudiante}</td>
                    <td>{v.producto}</td>
                    <td>{v.cantidad}</td>
                    <td>${v.precio}</td>
                    <td>${v.total}</td>
                    <td>{v.fecha ? v.fecha.split('T')[0] : ''}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => seleccionarParaEditar(v)} style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>
                          Editar
                        </button>
                        <button onClick={() => eliminarVenta(v.id)} className="btn-delete">
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default App;