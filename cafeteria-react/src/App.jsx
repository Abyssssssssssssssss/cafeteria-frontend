import React, { useState, useEffect } from 'react';
import { api } from './api';

function App() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);

  // Formulario
  const [estudianteId, setEstudianteId] = useState('');
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  // Cargar datos al iniciar
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resEst, resProd, resVen] = await Promise.all([
        api.get('/estudiantes'),
        api.get('/productos'),
        api.get('/ventas')
      ]);
      setEstudiantes(resEst.data);
      setProductos(resProd.data);
      setVentas(resVen.data);
    } catch (error) {
      console.error('Error al cargar información:', error);
    }
  };

  const handleRegistrarVenta = async (e) => {
    e.preventDefault();
    if (!estudianteId || !productoId) {
      alert('Por favor selecciona un estudiante y un producto.');
      return;
    }

    try {
      await api.post('/ventas', {
        estudiante_id: Number(estudianteId),
        producto_id: Number(productoId),
        cantidad: Number(cantidad),
        fecha
      });
      alert('¡Venta registrada con éxito!');
      cargarDatos(); // Recargar tabla
      setEstudianteId('');
      setProductoId('');
      setCantidad(1);
    } catch (error) {
      console.error('Error al registrar la venta:', error);
      alert('Ocurrió un error al registrar la venta.');
    }
  };

  const handleEliminarVenta = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta venta?')) return;
    try {
      await api.delete(`/ventas/${id}`);
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar venta:', error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '900px', margin: 'auto' }}>
      <h1>Cafetería Escolar</h1>

      {/* Formulario de registro */}
      <h2>Registrar Nueva Venta</h2>
      <form onSubmit={handleRegistrarVenta} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <select value={estudianteId} onChange={(e) => setEstudianteId(e.target.value)} required>
          <option value="">Seleccione estudiante</option>
          {estudiantes.map((est) => (
            <option key={est.id} value={est.id}>
              {est.nombre} {est.apellido}
            </option>
          ))}
        </select>

        <select value={productoId} onChange={(e) => setProductoId(e.target.value)} required>
          <option value="">Seleccione producto</option>
          {productos.map((prod) => (
            <option key={prod.id} value={prod.id}>
              {prod.nombre} (${prod.precio})
            </option>
          ))}
        </select>

        <input
          type="number"
          min="1"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          placeholder="Cantidad"
          required
        />

        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
        />

        <button type="submit">Registrar Venta</button>
      </form>

      <hr />

      {/* Tabla de ventas */}
      <h2>Ventas de la Cafetería</h2>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', textOverflow: 'ellipsis' }}>
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Total</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ventas.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center' }}>No hay ventas registradas</td>
            </tr>
          ) : (
            ventas.map((v) => (
              <tr key={v.id}>
                <td>{v.estudiante_nombre || v.estudiante || v.estudiante_id}</td>
                <td>{v.producto_nombre || v.producto || v.producto_id}</td>
                <td>{v.cantidad}</td>
                <td>${v.precio || 0}</td>
                <td>${v.total || (v.cantidad * (v.precio || 0))}</td>
                <td>{v.fecha ? v.fecha.split('T')[0] : ''}</td>
                <td>
                  <button onClick={() => handleEliminarVenta(v.id)}>Eliminar</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;