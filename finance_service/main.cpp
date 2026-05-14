#include "crow_all.h"
#include <cmath>

int main() {
    crow::SimpleApp app;

    CROW_ROUTE(app, "/calculate-retirement").methods(crow::HTTPMethod::Post)
    ([](const crow::request& req) {
        auto x = crow::json::load(req.body);
        if (!x) return crow::response(400);

        // Get data from the request
        int current_age = x["age"].i();
        double monthly_savings = x["monthly_savings"].d();
        double interest_rate = 0.07; // Assume 7% average return
        int retirement_age = 67;
        int years_to_invest = retirement_age - current_age;

        if (years_to_invest <= 0) return crow::response(200, "You are already at retirement age!");

        // Math: Compound interest with monthly contributions
        double r = interest_rate / 12;
        int n = years_to_invest * 12;
        double final_amount = monthly_savings * (pow(1 + r, n) - 1) / r * (1 + r);

        crow::json::wvalue res;
        res["retirement_total"] = final_amount;
        res["years_left"] = years_to_invest;
        
        return crow::response(res);
    });

    app.port(8080).multithreaded().run();
}