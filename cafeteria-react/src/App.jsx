import { useState, useEffect } from 'react';
import { api } from './api';
import './App.css';

function App() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);

  // Formulario para registrar venta
  const [estudianteId, setEstudianteId] = useState('');
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  // Función para cargar los datos desde la API de Render
  const cargarDatos = async () => {
    try {
      const [resEst, resProd, resVen] = await Promise.all([
        api.get('/estudiantes'),
        api.get('/productos'),
        api.get('/ventas')
      ]);

      // Validamos que cada respuesta sea un arreglo antes de guardarlo en el estado
      setEstudiantes(Array.isArray(resEst.data) ? resEst.data : []);
      setProductos(Array.isArray(resProd.data) ? resProd.data : []);
      setVentas(Array.isArray(resVen.data) ? resVen.data : []);
    } catch (error) {
      console.error('Error al cargar datos del backend:', error);
      setEstudiantes([]);
      setProductos([]);
      setVentas([]);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Registrar una nueva venta
  const registrarVenta = async (e) => {
    e.preventDefault();
    if (!estudianteId || !productoId || cantidad <= 0) {
      alert('Por favor completa todos los campos correctamente.');
      return;
    }

    try {
      await api.post('/ventas', {
        estudiante_id: estudianteId,
        producto_id: productoId,
        cantidad: Number(cantidad),
        fecha
      });
      alert('Venta registrada con éxito');
      cargarDatos();
      setCantidad(1);
    } catch (error) {
      console.error('Error al registrar venta:', error);
      alert('Error al registrar la venta');
    }
  };

  // Eliminar una venta
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
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Cafetería Escolar</h1>

      {/* Formulario de Registrar Venta */}
      <section style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Registrar Nueva Venta</h2>
        <form onSubmit={registrarVenta} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <label>Estudiante: </label>
            <select value={estudianteId} onChange={(e) => setEstudianteId(e.target.value)} required>
              <option value="">Selecciona un estudiante</option>
              {estudiantes.map((e) => (
                <option key={e.id} value={e.id}>{e.nombre} ({e.grupo})</option>
              ))}
            </select>
          </div>

          <div>
            <label>Producto: </label>
            <select value={productoId} onChange={(e) => setProductoId(e.target.value)} required>
              <option value="">Selecciona un producto</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre} - ${p.precio}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Cantidad: </label>
            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Fecha: </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
            />
          </div>

          <button type="submit" style={{ cursor: 'pointer', padding: '8px 16px' }}>Guardar Venta</button>
        </form>
      </section>

      {/* Tabla de Ventas */}
      <section>
        <h2>Ventas de la Cafetería</h2>
        <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', textAlign: 'left' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Estudiante</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio U.</th>
              <th>Total</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventas.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>No hay ventas registradas o cargando datos...</td>
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
                    <button onClick={() => eliminarVenta(v.id)} style={{ color: 'red', cursor: 'pointer' }}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default App;