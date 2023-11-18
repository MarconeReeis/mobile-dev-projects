import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

import 'HabitTime.dart';

class HabitsListPage extends StatefulWidget {
  const HabitsListPage({super.key});

  @override
  State<HabitsListPage> createState() => _HabitsListPageState();
}

class _HabitsListPageState extends State<HabitsListPage> {
  List habits = [
    {'title': 'Ácool', 'icon': FontAwesomeIcons.martiniGlass},
    {'title': 'Fumar', 'icon': FontAwesomeIcons.smoking},
    {'title': 'Drogas', 'icon': FontAwesomeIcons.cannabis},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10.0),
        child: ListView(
          children: [
            Stack(
              children: [
                Positioned(
                  top: 15.0,
                  left: 10.0,
                  child: IconButton(
                    icon: const Icon(FontAwesomeIcons.xmark),
                    onPressed: () {
                      Navigator.pop(context);
                    },
                  ),
                ),
                const SizedBox(
                  height: 10.0,
                ),
                const Padding(
                  padding: EdgeInsets.fromLTRB(
                      16.0, 90.0, 16.0, 20.0), // Adicionei um padding top maior
                  child: Text(
                    "Que vício ou mau hábito pretende abandonar?",
                    style:
                        TextStyle(fontSize: 18.0, fontWeight: FontWeight.bold),
                    textAlign: TextAlign.start,
                  ),
                ),
              ],
            ),
            SizedBox(
              height: MediaQuery.of(context).size.height - 100,
              child: ListView.builder(
                itemCount: habits.length,
                itemBuilder: (context, index) {
                  return Column(
                    children: [
                      ListTile(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (context) => const HabiTime()),
                          );
                        },
                        leading: Icon(
                          habits[index]['icon'],
                          color: Theme.of(context).primaryColor,
                          size: 28.0,
                        ),
                        title: Text(habits[index]['title']),
                        trailing: const Icon(Icons.arrow_forward_ios),
                      ),
                      const Divider(),
                    ],
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
