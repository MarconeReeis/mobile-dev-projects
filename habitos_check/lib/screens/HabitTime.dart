import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class HabiTime extends StatefulWidget {
  const HabiTime({super.key});

  @override
  State<HabiTime> createState() => _HabiTimeState();
}

class _HabiTimeState extends State<HabiTime> {
  late DateTime selectedDate = DateTime.now();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10.0),
        child: Column(
          children: [
            SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(18.0),
                child: Align(
                  alignment: Alignment.topLeft,
                  child: InkWell(
                    // Envolver com InkWell para dar feedback tátil ao tocar
                    onTap: () {
                      Navigator.pop(context);
                    },
                    child: const Row(
                      // Adicionado o Row
                      mainAxisSize: MainAxisSize
                          .min, // Para não ocupar toda a largura disponível
                      children: [
                        Icon(Icons
                            .arrow_back), // Alterado de IconButton para Icon
                        SizedBox(width: 8.0), // Espaçamento entre ícone e texto
                        Text("Voltar"), // Texto "Voltar" adicionado
                      ],
                    ),
                  ),
                ),
              ),
            ),
            Expanded(
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Image.asset(
                      'assets/images/habit_time.png',
                      fit: BoxFit.contain,
                      width: 180.0,
                      height: 180.0,
                    ),
                    const SizedBox(
                      height: 60.0,
                    ),
                    LayoutBuilder(builder: (context, constraints) {
                      return Column(
                        children: [
                          const Text(
                            "Quando foi a última vez que fez isto?",
                            style: TextStyle(
                              fontSize: 16.0,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(
                            height: 15.0,
                          ),
                          ElevatedButton(
                            style: ButtonStyle(
                              backgroundColor: MaterialStateProperty.all<Color>(
                                  Colors.grey[700]!),
                              minimumSize: MaterialStateProperty.all<Size>(
                                  const Size(280, 50)),
                              shape: MaterialStateProperty.all<
                                  RoundedRectangleBorder>(
                                RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8.0),
                                ),
                              ),
                            ),
                            onPressed: () async {
                              DateTime? pickedDate = await showDatePicker(
                                context: context,
                                initialDate:
                                    selectedDate, // aqui, a data inicial é a `selectedDate`
                                firstDate: DateTime(2000),
                                lastDate: DateTime.now().add(const Duration(
                                    days:
                                        365)), // permite escolher datas até um ano à frente, ajuste conforme necessário
                              );

                              if (pickedDate != null) {
                                // ignore: use_build_context_synchronously
                                TimeOfDay? pickedTime = await showTimePicker(
                                  context: context,
                                  initialTime:
                                      TimeOfDay.fromDateTime(selectedDate),
                                );

                                if (pickedTime != null) {
                                  // Atualizando o DateTime com a nova data e tempo escolhidos
                                  DateTime newDateTime = DateTime(
                                    pickedDate.year,
                                    pickedDate.month,
                                    pickedDate.day,
                                    pickedTime.hour,
                                    pickedTime.minute,
                                  );

                                  // Atualizando o estado da tela
                                  setState(() {
                                    selectedDate = newDateTime;
                                  });
                                }
                              }
                            },
                            child: Text(
                              DateFormat('dd/MM/yyyy - HH:mm')
                                  .format(selectedDate),
                              style: TextStyle(
                                fontWeight: FontWeight.w600,
                                fontSize: 16,
                                color: Theme.of(context).primaryColor,
                              ),
                            ),
                          )
                        ],
                      );
                    }),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: ElevatedButton(
                style: ButtonStyle(
                  backgroundColor: MaterialStateProperty.all<Color>(
                      Theme.of(context).primaryColor),
                  minimumSize:
                      MaterialStateProperty.all<Size>(const Size(280, 50)),
                  shape: MaterialStateProperty.all<RoundedRectangleBorder>(
                    RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                  ),
                ),
                onPressed: () {
                  // Código para avançar para a próxima tela
                },
                child: const Text(
                  "Salvar",
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 16,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
