import apiService from './apiService';

class CocheService {
    getAllCoches(params) {
        return apiService.get('/coches', { params });
    }

    getCocheById(id) {
        return apiService.get(`/coche/${id}`);
    }

    getUserCars() {
        return apiService.get('/user/coches');
    }

    publicarAnuncio(cocheData, imagenes, documentos) {
        const formData = new FormData();

        Object.keys(cocheData).forEach(key => {
            if (cocheData[key] !== null && cocheData[key] !== undefined) {
                formData.append(key, cocheData[key]);
            }
        });

        imagenes.forEach((imagen, index) => {
            formData.append(`imagenes[${index}]`, imagen);
        });

        documentos.forEach((documento, index) => {
            formData.append(`documentos[${index}]`, documento);
        });

        return apiService.post('/coches', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    updateCoche(id, cocheData) {
        return apiService.put(`/coches/${id}`, cocheData);
    }

    deleteCoche(id) {
        return apiService.delete(`/coche/${id}`);
    }

    addImage(cocheId, imagen) {
        const formData = new FormData();
        formData.append('imagen', imagen);

        return apiService.post(`/coches/${cocheId}/imagenes`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    removeImage(cocheId, imagenId) {
        return apiService.delete(`/coches/${cocheId}/imagenes/${imagenId}`);
    }

    addDocument(cocheId, formData) {
        return apiService.post(`/coches/${cocheId}/documentos`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    removeDocument(cocheId, documentoId) {
        return apiService.delete(`/coches/${cocheId}/documentos/${documentoId}`);
    }

    getMarcas() {
        return apiService.get('/marcas');
    }

    getModelosByMarca(marcaId) {
        return apiService.get(`/marcas/${marcaId}/modelos`);
    }

    getCategorias() {
        return apiService.get('/categorias');
    } getProvincias() {
        return apiService.get('/provincias');
    }

    verificarCoche(cocheId, verificado) {
        return apiService.put(`/coches/${cocheId}/verificar`, { verificado });
    }
}

export default new CocheService();