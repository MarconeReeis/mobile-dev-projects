import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:habitos_check/screens/HabitsListPage.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _selectedIndex = 0;
  List itemsList = ['1'];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });

    if (index == 0) {
      Navigator.push(context,
          MaterialPageRoute(builder: (context) => const HabitsListPage()));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        selectedItemColor: Theme.of(context).primaryColor,
        onTap: _onItemTapped,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(FontAwesomeIcons.plus),
            label: 'Adicionar',
          ),
          BottomNavigationBarItem(
            icon: Icon(FontAwesomeIcons.plus),
            label: 'Adicionar',
          ),
        ],
      ),
      body: SafeArea(
        child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10.0),
            child: itemsList.isEmpty
                ? Center(
                    child: Image.asset(
                      'assets/images/no_data.png',
                      fit: BoxFit.contain,
                      width: 350.0,
                      height: 350.0,
                    ),
                  )
                : Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(
                        height: 20.0,
                      ),
                      const Padding(
                        padding: EdgeInsets.all(15.0),
                        child: Text(
                          "Meus Hábitos",
                          style: TextStyle(
                              fontSize: 26,
                              fontWeight: FontWeight.bold,
                              color: Colors.white),
                        ),
                      ),
                      Expanded(
                        child: ListView.builder(
                          itemCount: itemsList.length,
                          itemBuilder: (context, index) {
                            return Card(
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10.0)),
                              margin: const EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 8),
                              child: Padding(
                                padding: const EdgeInsets.all(16.0),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment
                                      .start, // Alinha os itens no topo
                                  children: [
                                    Icon(
                                      Icons.access_alarm,
                                      color: Theme.of(context).primaryColor,
                                      size:
                                          40.0, // Ajuste o tamanho do ícone conforme necessário
                                    ),
                                    const SizedBox(width: 20.0),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          const Text(
                                            'Titulo Principal',
                                            style: TextStyle(
                                              fontSize: 15.0,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                          const SizedBox(height: 12.0),
                                          const Text(
                                            'Tempo de abstinência',
                                            style: TextStyle(
                                              fontWeight: FontWeight.w500,
                                              fontSize: 12.0,
                                              color: Colors.grey,
                                            ),
                                          ),
                                          const SizedBox(height: 5.0),
                                          const Text(
                                            '12h 27h 30s',
                                            style: TextStyle(
                                              fontSize: 15.0,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                          const SizedBox(
                                            height: 30.0,
                                          ),
                                          const Text(
                                            'Objetivo atual: 1 Dia',
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 12.0,
                                            ),
                                          ),
                                          const SizedBox(
                                            height: 10.0,
                                          ),
                                          Container(
                                            height:
                                                8.0, // Ajuste para o valor desejado
                                            decoration: BoxDecoration(
                                              borderRadius: BorderRadius.circular(
                                                  5.0), // Ajuste para o valor desejado
                                              color: Colors.grey[
                                                  200], // Cor do "track" do progresso
                                            ),
                                            child: ClipRRect(
                                              borderRadius: BorderRadius.circular(
                                                  5.0), // Igual ao valor acima
                                              child: LinearProgressIndicator(
                                                color: Theme.of(context)
                                                    .primaryColor,
                                                value: 0.4,
                                                backgroundColor: Colors
                                                    .transparent, // Mantenha isso transparente
                                              ),
                                            ),
                                          )
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      )
                    ],
                  )),
      ),
    );
  }
}
