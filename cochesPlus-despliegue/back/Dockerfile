# Usa la imagen oficial de PHP con Apache
FROM php:8.2-apache

# Instala extensiones de PHP necesarias
RUN apt-get update && apt-get install -y \
    zlib1g-dev \
    libzip-dev \
    git \
    unzip

RUN docker-php-ext-install pdo pdo_mysql zip

# Copiar la app
COPY cochesPlus-backend /var/www/html

# Cambiar permisos para Laravel
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

# Instalar Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Configurar el working directory
WORKDIR /var/www/html

# Habilitar mod_rewrite
RUN a2enmod rewrite

# Configurar Apache
RUN a2dissite 000-default.conf
COPY sitio_laravel.conf /etc/apache2/sites-available/
RUN a2ensite sitio_laravel.conf

# Instalar dependencias de Laravel
RUN php -d memory_limit=-1 /usr/local/bin/composer install --no-interaction --prefer-dist

# Exponer puerto
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]
