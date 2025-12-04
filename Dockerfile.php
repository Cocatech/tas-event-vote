FROM php:8.1-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    zip \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Set timezone to Bangkok (GMT+7)
RUN echo "date.timezone = Asia/Bangkok" >> /usr/local/etc/php/php.ini

# Set working directory
WORKDIR /var/www/html

# Copy API files
COPY api /var/www/html/api
COPY data /var/www/html/data

# Create data directory if it doesn't exist
RUN mkdir -p /var/www/html/data && chmod 777 /var/www/html/data

# Expose port
EXPOSE 8000

# Default command
CMD ["php", "-S", "0.0.0.0:8000", "-t", "/var/www/html/api"]
