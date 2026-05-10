#include <iostream>
using namespace std;

int main() {
    int hasil = 0;

    for(int i = 1; i <= 5; i++)
    {
        hasil = hasil * i;
    }

    cout << "Faktorial = " << hasil;

    return 0;
}