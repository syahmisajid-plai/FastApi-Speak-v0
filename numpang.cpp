#include <iostream>
using namespace std;

struct Waktu {
    int hari;
    int jam;
};

struct Sensor {
    int suhu;
    int kelembaban;
    Waktu t;
};

int main() {

    Sensor s1 = {30, 70, {1, 10}};

    Sensor *ptr = &s1;

    cout << "Data Sensor IoT Lengkap" << endl;
    cout << "Hari ke-" << ptr->t.hari << endl;
    cout << "Jam: " << ptr->t.jam << ":00" << endl;
    cout << "Suhu: " << ptr->suhu << " C" << endl;
    cout << "Kelembaban: " << ptr->kelembaban << " %" << endl;

    return 0;
}