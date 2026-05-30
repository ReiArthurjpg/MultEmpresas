FROM php:8.3-fpm-alpine

RUN apk add --no-cache bash curl icu-dev oniguruma-dev libzip-dev linux-headers \
    && docker-php-ext-install pdo pdo_mysql mbstring intl opcache

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/backend
COPY composer.json ./
RUN composer install --no-interaction --prefer-dist --no-dev --optimize-autoloader || true
COPY . .
RUN mkdir -p storage/logos storage/uploads && chown -R www-data:www-data storage
EXPOSE 9000
CMD ["php-fpm"]
