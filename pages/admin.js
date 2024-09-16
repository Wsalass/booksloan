import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { db } from '../lib/firebase'; // Asegúrate de configurar Firebase correctamente
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const Admin = () => {
  const [libros, setLibros] = useState([]);
  const [autores, setAutores] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [editoriales, setEditoriales] = useState([]);
  const [libro, setLibro] = useState({ titulo: '', resumen: '', imagen: '', autor_id: [], genero_id: [], editorial_id: '', cantidad: '' });
  const [selectedAutores, setSelectedAutores] = useState([]);
  const [selectedGeneros, setSelectedGeneros] = useState([]);
  const [autor, setAutor] = useState('');
  const [genero, setGenero] = useState('');
  const [editorial, setEditorial] = useState('');
  const [editLibroId, setEditLibroId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [librosSnapshot, autoresSnapshot, generosSnapshot, editorialesSnapshot] = await Promise.all([
        getDocs(collection(db, 'libros')),
        getDocs(collection(db, 'autores')),
        getDocs(collection(db, 'generos')),
        getDocs(collection(db, 'editoriales'))
      ]);

      setLibros(librosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setAutores(autoresSnapshot.docs.map(doc => ({ id: doc.id, nombre: doc.data().nombre })));
      setGeneros(generosSnapshot.docs.map(doc => ({ id: doc.id, nombre: doc.data().nombre })));
      setEditoriales(editorialesSnapshot.docs.map(doc => ({ id: doc.id, nombre: doc.data().nombre })));
    } catch (error) {
      toast.error('Error fetching data');
      console.error(error);
    }
  };

  const handleLibroChange = (e) => {
    setLibro({ ...libro, [e.target.name]: e.target.value });
  };

  const handleAutorChange = (selectedOptions) => {
    setSelectedAutores(selectedOptions.map(option => option.value));
  };

  const handleGeneroChange = (selectedOptions) => {
    setSelectedGeneros(selectedOptions.map(option => option.value));
  };

  const handleAddLibro = async (e) => {
    e.preventDefault();
    try {
      if (editLibroId) {
        await updateLibro();
      } else {
        await addLibro();
      }
    } catch (error) {
      toast.error('Error saving libro');
      console.error(error);
    }
  };

  const addLibro = async () => {
    try {
      const createdAt = new Date().toISOString();
      const docRef = await addDoc(collection(db, 'libros'), {
        ...libro,
        autor_id: selectedAutores,
        genero_id: selectedGeneros,
        created_at: createdAt
      });

      setLibros([...libros, { id: docRef.id, ...libro, autor_id: selectedAutores, genero_id: selectedGeneros }]);
      toast.success('Libro agregado con éxito');
      resetLibroForm();
    } catch (error) {
      toast.error('Error adding libro');
      console.error(error);
    }
  };

  const updateLibro = async () => {
    try {
      const libroRef = doc(db, 'libros', editLibroId);
      await updateDoc(libroRef, {
        ...libro,
        autor_id: selectedAutores,
        genero_id: selectedGeneros
      });

      const updatedLibros = libros.map(lib => (lib.id === editLibroId ? { ...lib, ...libro, autor_id: selectedAutores, genero_id: selectedGeneros } : lib));
      setLibros(updatedLibros);
      toast.success('Libro actualizado con éxito');
      resetLibroForm();
    } catch (error) {
      toast.error('Error updating libro');
      console.error(error);
    }
  };

  const handleDeleteLibro = async (id) => {
    try {
      await deleteDoc(doc(db, 'libros', id));

      setLibros(libros.filter(libro => libro.id !== id));
      toast.success('Libro eliminado con éxito');
    } catch (error) {
      toast.error('Error deleting libro');
      console.error(error);
    }
  };
  const handleEditLibro = (libro) => {
    setEditLibroId(libro.id);
    setLibro({
      titulo: libro.titulo,
      resumen: libro.resumen,
      imagen: libro.imagen,
      autor_id: libro.autor_id,
      genero_id: libro.genero_id,
      editorial_id: libro.editorial_id,
      cantidad: libro.cantidad,
    });
    setSelectedAutores(libro.autor_id);
    setSelectedGeneros(libro.genero_id);
  };

  const handleAddAutor = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, 'autores'), { nombre: autor });

      setAutores([...autores, { id: docRef.id, nombre: autor }]);
      toast.success('Autor agregado con éxito');
      setAutor('');
    } catch (error) {
      toast.error('Error adding autor');
      console.error(error);
    }
  };

  const handleDeleteAutor = async (id) => {
    try {
      await deleteDoc(doc(db, 'autores', id));

      setAutores(autores.filter(autor => autor.id !== id));
      toast.success('Autor eliminado con éxito');
    } catch (error) {
      toast.error('Error deleting autor');
      console.error(error);
    }
  };

  const handleAddGenero = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, 'generos'), { nombre: genero });

      setGeneros([...generos, { id: docRef.id, nombre: genero }]);
      toast.success('Género agregado con éxito');
      setGenero('');
    } catch (error) {
      toast.error('Error adding genero');
      console.error(error);
    }
  };

  const handleDeleteGenero = async (id) => {
    try {
      await deleteDoc(doc(db, 'generos', id));

      setGeneros(generos.filter(genero => genero.id !== id));
      toast.success('Género eliminado con éxito');
    } catch (error) {
      toast.error('Error deleting genero');
      console.error(error);
    }
  };

  const handleAddEditorial = async (e) => {
    e.preventDefault();
    try {
      const { nombre, imagen } = editorial;
      const docRef = await addDoc(collection(db, 'editoriales'), { nombre, imagen });

      setEditoriales([...editoriales, { id: docRef.id, nombre, imagen }]);
      toast.success('Editorial agregada con éxito');
      setEditorial({ nombre: '', imagen: '' });
    } catch (error) {
      toast.error('Error adding editorial');
      console.error(error);
    }
  };
  const handleDeleteEditorial = async (id) => {
    try {
      await deleteDoc(doc(db, 'editoriales', id));

      setEditoriales(editoriales.filter(editorial => editorial.id !== id));
      toast.success('Editorial eliminada con éxito');
    } catch (error) {
      toast.error('Error deleting editorial');
      console.error(error);
    }
  };

  const resetLibroForm = () => {
    setLibro({ titulo: '', resumen: '', imagen: '', autor_id: [], genero_id: [], editorial_id: '', cantidad: '' });
    setSelectedAutores([]);
    setSelectedGeneros([]);
    setEditLibroId(null);
  };

  return (
    <div className="p-8">
      {/* Formulario para Agregar o Editar Libros */}
      <div className="mb-12 bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">
          {editLibroId ? 'Editar Libro' : 'Agregar Libro'}
        </h2>
        <form onSubmit={handleAddLibro}>
          <p className="">Título</p>
          <input
            type="text"
            name="titulo"
            value={libro.titulo}
            onChange={handleLibroChange}
            placeholder="Título del Libro"
            className="mb-4 px-4 py-3 border border-gray-300 rounded-lg w-full"
            required
          />
          <p className="">Resumen</p>
          <textarea
            name="resumen"
            value={libro.resumen}
            onChange={handleLibroChange}
            placeholder="Resumen del Libro"
            className="mb-4 px-4 py-3 border border-gray-300 rounded-lg w-full"
            required
          />
          <div className="mb-4">
            <label className="block text-gray-700">Selecciona Autores:</label>
            <Select
              isMulti
              options={autores.map(autor => ({ value: autor.id, label: autor.nombre }))}
              value={autores.filter(autor => selectedAutores.includes(autor.id)).map(autor => ({ value: autor.id, label: autor.nombre }))}
              onChange={handleAutorChange}
              className="mb-4"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Selecciona Géneros:</label>
            <Select
              isMulti
              options={generos.map(genero => ({ value: genero.id, label: genero.nombre }))}
              value={generos.filter(genero => selectedGeneros.includes(genero.id)).map(genero => ({ value: genero.id, label: genero.nombre }))}
              onChange={handleGeneroChange}
              className="mb-4"
            />
          </div>
          <p className="">Editorial</p>
          <Select
            options={editoriales.map(editorial => ({ value: editorial.id, label: editorial.nombre }))}
            value={editoriales.find(editorial => editorial.id === libro.editorial_id) ? { value: libro.editorial_id, label: editoriales.find(editorial => editorial.id === libro.editorial_id).nombre } : null}
            onChange={(option) => setLibro({ ...libro, editorial_id: option ? option.value : '' })}
            className="mb-4"
          />
          <p className="">Imagen (URL)</p>
          <input
            type="text"
            name="imagen"
            value={libro.imagen}
            onChange={handleLibroChange}
            placeholder="URL de la Imagen del Libro"
            className="mb-4 px-4 py-3 border border-gray-300 rounded-lg w-full"
          />
          <p className="">Cantidad Disponible</p>
          <input
            type="number"
            name="cantidad"
            value={libro.cantidad}
            onChange={handleLibroChange}
            placeholder="Cantidad de Libros Disponibles"
            className="mb-4 px-4 py-3 border border-gray-300 rounded-lg w-full"
            required
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">
            {editLibroId ? 'Actualizar Libro' : 'Agregar Libro'}
          </button>
          {editLibroId && (
            <button
              type="button"
              onClick={() => resetLibroForm()}
              className="ml-4 bg-gray-500 text-white px-4 py-2 rounded-lg"
            >
              Cancelar
            </button>
          )}
        </form>
      </div>

      {/* Listado de Libros */}
      <div className="mb-12">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">Lista de Libros</h2>
        {libros.length === 0 ? (
          <p className="text-gray-500">No hay libros disponibles.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {libros.map((libro) => (
              <div key={libro.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <h3 className="text-xl font-semibold mb-2">{libro.titulo}</h3>
                {libro.imagen && <img src={libro.imagen} alt={libro.titulo} className="w-full h-48 object-cover" />}
                <button
                  onClick={() => handleEditLibro(libro)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 mr-2"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteLibro(libro.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulario para Agregar Autores */}
      <div className="mt-12 bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Agregar Autor</h2>
        <form onSubmit={handleAddAutor}>
          <input
            type="text"
            value={autor}
            onChange={(e) => setAutor(e.target.value)}
            placeholder="Nombre del Autor"
            className="mb-4 px-4 py-3 border border-gray-300 rounded-lg w-full"
            required
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">
            Agregar Autor
          </button>
        </form>
      </div>

      {/* Formulario para Agregar Géneros */}
      <div className="mt-12 bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Agregar Género</h2>
        <form onSubmit={handleAddGenero}>
          <input
            type="text"
            value={genero}
            onChange={(e) => setGenero(e.target.value)}
            placeholder="Nombre del Género"
            className="mb-4 px-4 py-3 border border-gray-300 rounded-lg w-full"
            required
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">
            Agregar Género
          </button>
        </form>
      </div>

     {/* Formulario para Agregar Editoriales */}
     <div className="mt-12 bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Agregar Editorial</h2>
        <form onSubmit={handleAddEditorial}>
          <input
            type="text"
            value={editorial.nombre}
            onChange={(e) => setEditorial({ ...editorial, nombre: e.target.value })}
            placeholder="Nombre de la Editorial"
            className="mb-4 px-4 py-3 border border-gray-300 rounded-lg w-full"
            required
          />
          <p className="">Imagen (URL)</p>
          <input
            type="text"
            value={editorial.imagen}
            onChange={(e) => setEditorial({ ...editorial, imagen: e.target.value })}
            placeholder="URL de la Imagen de la Editorial"
            className="mb-4 px-4 py-3 border border-gray-300 rounded-lg w-full"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">
            Agregar Editorial
          </button>
        </form>
      </div>
    </div>
  );
};

export default Admin;
