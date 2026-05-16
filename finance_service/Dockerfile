FROM ubuntu:22.04

# Install the C++ compiler and download tools
RUN apt-get update && apt-get install -y g++ make wget

WORKDIR /app

# Download the official standalone Crow framework
RUN wget https://github.com/CrowCpp/Crow/releases/download/v1.0+5/crow_all.h

# Copy your main.cpp into the container
COPY . .

# Compile your code with threading enabled (required by Crow)
RUN g++ -O3 main.cpp -o finance_engine -pthread

# Start the server!
CMD ["./finance_engine"]