# Use the official GCC image to get a full C++ environment
FROM gcc:latest

WORKDIR /app

# Install the networking library (Asio) that Crow relies on
RUN apt-get update && apt-get install -y libasio-dev wget

# Download the official Crow framework header file
RUN wget https://github.com/CrowCpp/Crow/releases/download/v1.0+5/crow_all.h

# Copy your C++ source code into the container
COPY main.cpp .

# Compile the code into an executable named 'finance_engine'
RUN g++ -O3 main.cpp -lpthread -o finance_engine

# The command to run when the container starts
CMD ["./finance_engine"]